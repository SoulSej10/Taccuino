import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();
const userId = "default-user-id";

router.get("/", async (_req, res, next) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        _count: { select: { notes: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(tags);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, color, parentId } = req.body;

    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color ?? "#3b82f6",
        parentId: parentId || null,
        userId,
      },
    });

    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, color, parentId } = req.body;

    const existing = await prisma.tag.findFirst({ where: { id, userId } });

    if (!existing) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: { name, color, parentId },
    });

    res.json(tag);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.tag.findFirst({ where: { id, userId } });

    if (!existing) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    await prisma.noteTag.deleteMany({ where: { tagId: id } });
    await prisma.tag.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
