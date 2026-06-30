import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();
const userId = "default-user-id";

router.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q as string) || "";

    if (!q.trim()) {
      res.json({ notes: [], notebooks: [], tags: [] });
      return;
    }

    const [notes, notebooks, tags] = await Promise.all([
      prisma.note.findMany({
        where: {
          userId,
          status: "active",
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
            { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
          ],
        },
        take: 20,
        include: { tags: { include: { tag: true } } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.notebook.findMany({
        where: { userId, name: { contains: q, mode: "insensitive" } },
        take: 20,
      }),
      prisma.tag.findMany({
        where: { userId, name: { contains: q, mode: "insensitive" } },
        take: 20,
      }),
    ]);

    res.json({ notes, notebooks, tags });
  } catch (err) {
    next(err);
  }
});

export default router;
