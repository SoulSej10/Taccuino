import type { Request, Response, NextFunction } from "express";

export function requireBody(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing = fields.filter(
      (field) => req.body[field] === undefined || req.body[field] === null,
    );

    if (missing.length > 0) {
      res.status(400).json({
        error: `Missing required fields: ${missing.join(", ")}`,
        fields: missing,
      });
      return;
    }

    next();
  };
}
