import { nanoid } from "nanoid";
import { getTemporalClient, closeTemporalClient } from "./client/temporal-client";
import { temporalConfig } from "./config/temporal.config";
import type { ShipmentOrder } from "@boltline/shared-types";

async function main(): Promise<void> {
  const client = await getTemporalClient();

  const order: ShipmentOrder = {
    orderId: `order-${nanoid()}`,
    partId: "part-001",
    quantity: 10,
    timestamp: Date.now(),
  };

  console.log("Starting shipment workflow...");
  console.log(`Order: ${JSON.stringify(order, null, 2)}`);

  try {
    const result = await client.workflow.execute("shipmentWorkflow", {
      args: [order],
      taskQueue: temporalConfig.taskQueue,
      workflowId: order.orderId,
    });

    console.log("✓ Workflow completed:");
    console.log(`  Result: ${result}`);
    console.log(`  View workflow in Temporal UI: http://localhost:8088/namespaces/${temporalConfig.namespace}/workflows/${order.orderId}`);
  } catch (error) {
    console.error("✗ Workflow failed:", error);
  } finally {
    await closeTemporalClient();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
