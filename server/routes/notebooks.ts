import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();
const userId = "default-user-id";

router.get("/", async (req, res, next) => {
  try {
    const notebooks = await prisma.notebook.findMany({
      where: { userId },
      include: {
        _count: { select: { notes: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(notebooks);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, description, icon, color, parentId } = req.body;

    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const notebook = await prisma.notebook.create({
      data: {
        name,
        description: description ?? "",
        icon: icon ?? "📓",
        color: color ?? "#3b82f6",
        parentId: parentId || null,
        userId,
      },
    });

    res.status(201).json(notebook);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, parentId } = req.body;

    const existing = await prisma.notebook.findFirst({ where: { id, userId } });

    if (!existing) {
      res.status(404).json({ error: "Notebook not found" });
      return;
    }

    const notebook = await prisma.notebook.update({
      where: { id },
      data: { name, description, icon, color, parentId },
    });

    res.json(notebook);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.notebook.findFirst({ where: { id, userId } });

    if (!existing) {
      res.status(404).json({ error: "Notebook not found" });
      return;
    }

    await prisma.note.updateMany({
      where: { notebookId: id },
      data: { notebookId: null },
    });

    await prisma.notebook.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
