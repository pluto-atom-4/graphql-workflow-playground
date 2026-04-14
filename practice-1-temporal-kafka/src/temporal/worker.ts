import { Worker, NativeConnection } from "@temporalio/worker";
import * as validateOrderActivity from "./activities/validate-order.activity";
import * as reserveInventoryActivity from "./activities/reserve-inventory.activity";
import * as emitKafkaEventActivity from "./activities/emit-kafka-event.activity";
import { temporalConfig } from "../config/temporal.config";

async function main(): Promise<void> {
  const connection = await NativeConnection.connect({
    address: temporalConfig.address,
  });

  const worker = await Worker.create({
    workflowsPath: require.resolve("./workflows"),
    activities: {
      validateOrder: validateOrderActivity.validateOrder,
      reserveInventory: reserveInventoryActivity.reserveInventory,
      emitKafkaEvent: emitKafkaEventActivity.emitKafkaEvent,
    },
    taskQueue: temporalConfig.taskQueue,
    connection,
  });

  console.log("Starting Temporal worker...");
  console.log(`Task queue: ${temporalConfig.taskQueue}`);
  console.log(`Temporal address: ${temporalConfig.address}`);
  console.log(`Namespace: ${temporalConfig.namespace}`);

  await worker.run();
}

main().catch((error) => {
  console.error("Worker error:", error);
  process.exit(1);
});
