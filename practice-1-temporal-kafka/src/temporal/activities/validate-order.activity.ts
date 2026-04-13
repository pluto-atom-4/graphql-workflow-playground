import { defineSignal, defineQuery } from "@temporalio/activity";
import type { ValidateOrderResult, ShipmentOrder } from "@boltline/shared-types";

export async function validateOrder(order: ShipmentOrder): Promise<ValidateOrderResult> {
  // Simulate validation logic
  console.log(`Validating order: ${order.orderId}`);

  // In a real app, this would check against a database
  const isValid = order.quantity > 0 && order.partId && order.orderId;

  return {
    valid: isValid,
    orderId: order.orderId,
    reason: isValid ? undefined : "Invalid order data",
  };
}
