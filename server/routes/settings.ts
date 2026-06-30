import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();
const userId = "default-user-id";

router.get("/", async (req, res, next) => {
  try {
    let settings = await prisma.settings.findUnique({ where: { userId } });

    if (!settings) {
      settings = await prisma.settings.create({ data: { userId } });
    }

    res.json(settings);
  } catch (err) {
    next(err);
  }
});

router.put("/", async (req, res, next) => {
  try {
    let settings = await prisma.settings.findUnique({ where: { userId } });

    if (!settings) {
      settings = await prisma.settings.create({ data: { userId } });
    }

    const updated = await prisma.settings.update({
      where: { userId },
      data: req.body,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
