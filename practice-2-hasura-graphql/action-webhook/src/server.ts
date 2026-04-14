import express, { Express, Request, Response } from "express";
import { validateWebhookSecret } from "./middleware/auth.middleware";
import { handlePlaceOrder } from "./handlers/place-order.handler";
import { errorMiddleware } from "./middleware/error.middleware";

const app: Express = express();
const PORT = process.env.ACTION_WEBHOOK_PORT ?? 3001;

// Middleware
app.use(express.json());

// Health check endpoint
app.get("/health", (_req: Request, res: Response): void => {
  res.status(200).json({ status: "ok" });
});

// Hasura Action: placeOrder
app.post("/actions/place-order", validateWebhookSecret, handlePlaceOrder);

// Error handling
app.use(errorMiddleware);

// Start server
app.listen(PORT, (): void => {
  console.log(`Action webhook server listening on port ${PORT}`);
});
