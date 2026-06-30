import { Router } from "express";
import prisma from "../prisma.js";
import type { Prisma } from "@prisma/client";

const router = Router();
const userId = "default-user-id";

router.post("/bulk", async (req, res, next) => {
  try {
    const { ids, action } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: "ids must be a non-empty array" });
      return;
    }

    const validActions = ["delete", "archive", "restore", "favorite", "pin"];
    if (!validActions.includes(action)) {
      res.status(400).json({ error: `Invalid action. Must be one of: ${validActions.join(", ")}` });
      return;
    }

    const data: Record<string, unknown> = {};
    switch (action) {
      case "delete":
        data.status = "trashed";
        data.trashedAt = new Date();
        break;
      case "archive":
        data.status = "archived";
        data.archivedAt = new Date();
        break;
      case "restore":
        data.status = "active";
        data.trashedAt = null;
        data.archivedAt = null;
        break;
      case "favorite":
        data.favorite = true;
        break;
      case "pin":
        data.pinned = true;
        break;
    }

    await prisma.note.updateMany({
      where: { id: { in: ids }, userId },
      data,
    });

    res.json({ success: true, count: ids.length });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const {
      status = "active",
      notebookId,
      tagId,
      favorite,
      pinned,
      search,
      sort = "updatedAt",
      order = "desc",
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;

    const where: Prisma.NoteWhereInput = { userId };

    if (status) where.status = status;
    if (notebookId) where.notebookId = notebookId;
    if (tagId) where.tags = { some: { tagId } };
    if (favorite !== undefined) where.favorite = favorite === "true";
    if (pinned !== undefined) where.pinned = pinned === "true";

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { tags: { some: { tag: { name: { contains: search, mode: "insensitive" } } } } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const orderField = ["title", "createdAt"].includes(sort) ? sort : "updatedAt";
    const orderDir = order === "asc" ? "asc" : "desc";

    const [data, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: { tags: { include: { tag: true } } },
        orderBy: { [orderField]: orderDir },
        skip,
        take: limitNum,
      }),
      prisma.note.count({ where }),
    ]);

    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, content, notebookId, tags, color, category } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: "title and content are required" });
      return;
    }

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const charCount = content.length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const note = await prisma.note.create({
      data: {
        title,
        content,
        color,
        category,
        notebookId: notebookId || null,
        wordCount,
        charCount,
        readingTime,
        userId,
        ...(Array.isArray(tags) && tags.length > 0
          ? {
              tags: {
                create: await Promise.all(
                  tags.map((name: string) =>
                    prisma.tag
                      .upsert({
                        where: { name_userId: { name, userId } },
                        update: {},
                        create: { name, userId },
                      })
                      .then((tag) => ({ tagId: tag.id })),
                  ),
                ),
              },
            }
          : {}),
      },
      include: { tags: { include: { tag: true } } },
    });

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const note = await prisma.note.findFirst({
      where: { id: req.params.id, userId },
      include: {
        tags: { include: { tag: true } },
        versions: { orderBy: { createdAt: "desc" } },
        reminders: true,
        tasks: { orderBy: { order: "asc" } },
        attachments: true,
      },
    });

    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    res.json(note);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tags, ...fields } = req.body;

    const existing = await prisma.note.findFirst({ where: { id, userId } });

    if (!existing) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    if (fields.content !== undefined && existing.content !== fields.content) {
      await prisma.noteVersion.create({
        data: {
          noteId: id,
          title: existing.title,
          content: existing.content,
          wordCount: existing.wordCount,
          charCount: existing.charCount,
        },
      });
    }

    if (fields.content !== undefined) {
      const content = fields.content as string;
      fields.wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
      fields.charCount = content.length;
      fields.readingTime = Math.max(1, Math.ceil(fields.wordCount / 200));
    }

    if (Array.isArray(tags)) {
      await prisma.noteTag.deleteMany({ where: { noteId: id } });

      if (tags.length > 0) {
        const tagRecords = await Promise.all(
          tags.map((name: string) =>
            prisma.tag.upsert({
              where: { name_userId: { name, userId } },
              update: {},
              create: { name, userId },
            }),
          ),
        );

        await prisma.noteTag.createMany({
          data: tagRecords.map((tag) => ({ noteId: id, tagId: tag.id })),
        });
      }
    }

    const note = await prisma.note.update({
      where: { id },
      data: fields,
      include: { tags: { include: { tag: true } } },
    });

    res.json(note);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.note.findFirst({ where: { id, userId } });

    if (!existing) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    await prisma.note.update({
      where: { id },
      data: { status: "trashed", trashedAt: new Date() },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/restore", async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.note.findFirst({ where: { id, userId } });

    if (!existing) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    const note = await prisma.note.update({
      where: { id },
      data: { status: "active", trashedAt: null },
      include: { tags: { include: { tag: true } } },
    });

    res.json(note);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/duplicate", async (req, res, next) => {
  try {
    const { id } = req.params;

    const original = await prisma.note.findFirst({
      where: { id, userId },
      include: { tags: true },
    });

    if (!original) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    const note = await prisma.note.create({
      data: {
        title: `${original.title} (Copy)`,
        content: original.content,
        color: original.color,
        category: original.category,
        notebookId: original.notebookId,
        pinned: original.pinned,
        wordCount: original.wordCount,
        charCount: original.charCount,
        readingTime: original.readingTime,
        userId,
        tags: {
          create: original.tags.map((nt) => ({ tagId: nt.tagId })),
        },
      },
      include: { tags: { include: { tag: true } } },
    });

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/archive", async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.note.findFirst({ where: { id, userId } });

    if (!existing) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    const isArchived = existing.status === "archived";

    const note = await prisma.note.update({
      where: { id },
      data: {
        status: isArchived ? "active" : "archived",
        archivedAt: isArchived ? null : new Date(),
      },
      include: { tags: { include: { tag: true } } },
    });

    res.json(note);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/pin", async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.note.findFirst({ where: { id, userId } });

    if (!existing) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    const note = await prisma.note.update({
      where: { id },
      data: { pinned: !existing.pinned },
      include: { tags: { include: { tag: true } } },
    });

    res.json(note);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/favorite", async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.note.findFirst({ where: { id, userId } });

    if (!existing) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    const note = await prisma.note.update({
      where: { id },
      data: { favorite: !existing.favorite },
      include: { tags: { include: { tag: true } } },
    });

    res.json(note);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/move", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notebookId } = req.body;

    const existing = await prisma.note.findFirst({ where: { id, userId } });

    if (!existing) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    const note = await prisma.note.update({
      where: { id },
      data: { notebookId: notebookId || null },
      include: { tags: { include: { tag: true } } },
    });

    res.json(note);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/versions", async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.note.findFirst({ where: { id, userId } });

    if (!existing) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    const versions = await prisma.noteVersion.findMany({
      where: { noteId: id },
      orderBy: { createdAt: "desc" },
    });

    res.json(versions);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/versions/:versionId", async (req, res, next) => {
  try {
    const { id, versionId } = req.params;

    const existing = await prisma.note.findFirst({ where: { id, userId } });

    if (!existing) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    const version = await prisma.noteVersion.findFirst({
      where: { id: versionId, noteId: id },
    });

    if (!version) {
      res.status(404).json({ error: "Version not found" });
      return;
    }

    res.json(version);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/versions/:versionId/restore", async (req, res, next) => {
  try {
    const { id, versionId } = req.params;

    const existing = await prisma.note.findFirst({ where: { id, userId } });

    if (!existing) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    const version = await prisma.noteVersion.findFirst({
      where: { id: versionId, noteId: id },
    });

    if (!version) {
      res.status(404).json({ error: "Version not found" });
      return;
    }

    await prisma.noteVersion.create({
      data: {
        noteId: id,
        title: existing.title,
        content: existing.content,
        wordCount: existing.wordCount,
        charCount: existing.charCount,
        editor: "auto-save",
      },
    });

    const note = await prisma.note.update({
      where: { id },
      data: {
        title: version.title,
        content: version.content,
        wordCount: version.wordCount,
        charCount: version.charCount,
        readingTime: Math.max(1, Math.ceil(version.wordCount / 200)),
      },
      include: { tags: { include: { tag: true } } },
    });

    res.json(note);
  } catch (err) {
    next(err);
  }
});

export default router;
