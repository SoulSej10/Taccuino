import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: { code?: string; status?: number; statusCode?: number; message?: string; details?: string },
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  console.error("Error:", err);

  if (err?.code === "P2002") {
    res.status(409).json({ error: "A record with this value already exists." });
    return;
  }

  if (err?.code === "P2025") {
    res.status(404).json({ error: "Record not found." });
    return;
  }

  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || "Internal server error";

  res.status(status).json({
    error: message,
    ...(err.details ? { details: err.details } : {}),
  });
}
