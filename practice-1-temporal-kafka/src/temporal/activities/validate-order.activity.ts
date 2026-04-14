import type { ValidateOrderResult, ShipmentOrder } from "@boltline/shared-types";

export async function validateOrder(order: ShipmentOrder): Promise<ValidateOrderResult> {
  // Simulate validation logic
  console.log(`Validating order: ${order.orderId}`);

  // In a real app, this would check against a database
  const isValid = Boolean(order.quantity > 0 && order.partId && order.orderId);

  if (isValid) {
    return {
      valid: true,
      orderId: order.orderId,
    };
  }

  return {
    valid: false,
    orderId: order.orderId,
    reason: "Invalid order data",
  };
}
