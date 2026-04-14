import { Request, Response, NextFunction } from "express";

export function validateWebhookSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers["x-webhook-secret"];
  const expectedSecret = process.env.ACTION_WEBHOOK_SECRET ?? "webhook-secret-12345";

  if (secret !== expectedSecret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
