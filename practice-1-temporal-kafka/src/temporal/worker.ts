import { Worker } from "@temporalio/worker";
import * as activities from "./activities/validate-order.activity";
import * as activitiesReserve from "./activities/reserve-inventory.activity";
import * as activitiesKafka from "./activities/emit-kafka-event.activity";
import * as workflows from "./workflows/shipment.workflow";
import { temporalConfig } from "../config/temporal.config";

async function main(): Promise<void> {
  const worker = await Worker.create({
    workflowsPath: require.resolve("./workflows"),
    activitiesPath: [
      require.resolve("./activities/validate-order.activity"),
      require.resolve("./activities/reserve-inventory.activity"),
      require.resolve("./activities/emit-kafka-event.activity"),
    ],
    taskQueue: temporalConfig.taskQueue,
    replayHistories: [],
    serverOptions: {
      address: temporalConfig.address,
    },
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
