import {
  proxyActivities,
  ApplicationFailure,
  RetryPolicy,
} from "@temporalio/workflow";
import { validateOrder } from "../activities/validate-order.activity";
import { reserveInventory } from "../activities/reserve-inventory.activity";
import { emitKafkaEvent } from "../activities/emit-kafka-event.activity";
import type { ShipmentOrder } from "@boltline/shared-types";

const activities = proxyActivities<typeof import("../activities/validate-order.activity")>({
  startToCloseTimeout: "1 minute",
});

const activitiesReserve = proxyActivities<
  typeof import("../activities/reserve-inventory.activity")
>({
  startToCloseTimeout: "1 minute",
  retry: new RetryPolicy({
    initialInterval: "1s",
    backoffCoefficient: 2,
    maximumInterval: "10s",
    maximumAttempts: 3,
  }),
});

const activitiesKafka = proxyActivities<
  typeof import("../activities/emit-kafka-event.activity")
>({
  startToCloseTimeout: "1 minute",
});

export async function shipmentWorkflow(order: ShipmentOrder): Promise<string> {
  // Step 1: Validate order
  const validation = await activities.validateOrder(order);
  if (!validation.valid) {
    throw ApplicationFailure.nonRetryable(`Order validation failed: ${validation.reason}`);
  }

  // Step 2: Reserve inventory (with retries)
  const reservation = await activitiesReserve.reserveInventory({
    partId: order.partId,
    quantity: order.quantity,
    orderId: order.orderId,
  });

  if (!reservation.reserved) {
    throw ApplicationFailure.nonRetryable("Inventory reservation failed");
  }

  // Step 3: Emit Kafka event
  await activitiesKafka.emitKafkaEvent({
    orderId: order.orderId,
    partId: order.partId,
    quantity: order.quantity,
  });

  return `Shipment workflow completed for order: ${order.orderId}`;
}
