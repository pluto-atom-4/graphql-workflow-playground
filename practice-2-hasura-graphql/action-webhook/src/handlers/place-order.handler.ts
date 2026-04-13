import { Request, Response } from "express";
import { query } from "../db/client";

export interface PlaceOrderInput {
  part_id: string;
  quantity: number;
}

export interface PlaceOrderPayload {
  input: PlaceOrderInput;
}

export interface PlaceOrderResponse {
  orderId: string;
  status: string;
  message: string;
}

export async function handlePlaceOrder(
  req: Request<unknown, unknown, PlaceOrderPayload>,
  res: Response<PlaceOrderResponse>
): Promise<void> {
  const { input } = req.body;
  const { part_id, quantity } = input;

  // Validation
  if (!part_id || !quantity || quantity <= 0) {
    res.status(400).json({
      orderId: "",
      status: "ERROR",
      message: "Invalid input: part_id and quantity (> 0) are required",
    });
    return;
  }

  // Check if part exists
  const partResult = await query("SELECT id FROM parts WHERE id = $1", [
    part_id,
  ]);
  if (partResult.rows.length === 0) {
    res.status(400).json({
      orderId: "",
      status: "ERROR",
      message: `Part not found: ${part_id}`,
    });
    return;
  }

  // Check inventory
  const inventoryResult = await query(
    "SELECT SUM(quantity) as total FROM inventory WHERE part_id = $1",
    [part_id]
  );
  const availableQuantity =
    inventoryResult.rows[0]?.total ?? 0;

  if (availableQuantity < quantity) {
    res.status(400).json({
      orderId: "",
      status: "ERROR",
      message: `Insufficient inventory: ${availableQuantity} available, ${quantity} requested`,
    });
    return;
  }

  // Insert order
  const orderResult = await query(
    "INSERT INTO orders (part_id, quantity, status) VALUES ($1, $2, 'PENDING') RETURNING id",
    [part_id, quantity]
  );

  const orderId = orderResult.rows[0]?.id;
  res.status(200).json({
    orderId,
    status: "PENDING",
    message: `Order created successfully: ${orderId}`,
  });
}
