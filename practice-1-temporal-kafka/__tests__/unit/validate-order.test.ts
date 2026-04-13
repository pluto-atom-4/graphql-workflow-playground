import { validateOrder } from "../../src/temporal/activities/validate-order.activity";
import type { ShipmentOrder } from "@boltline/shared-types";

describe("validateOrder activity", () => {
  it("should validate a correct order", async () => {
    const order: ShipmentOrder = {
      orderId: "order-123",
      partId: "part-001",
      quantity: 10,
      timestamp: Date.now(),
    };

    const result = await validateOrder(order);

    expect(result.valid).toBe(true);
    expect(result.orderId).toBe("order-123");
  });

  it("should reject an order with zero quantity", async () => {
    const order: ShipmentOrder = {
      orderId: "order-456",
      partId: "part-001",
      quantity: 0,
      timestamp: Date.now(),
    };

    const result = await validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.reason).toBeDefined();
  });
});
