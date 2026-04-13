import { sendToTopic } from "../../kafka/producer";
import { SHIPMENT_EVENTS_TOPIC } from "../../kafka/topics";
import type { ShipmentEvent } from "@boltline/shared-types";

export interface EmitKafkaEventInput {
  orderId: string;
  partId: string;
  quantity: number;
}

export async function emitKafkaEvent(input: EmitKafkaEventInput): Promise<void> {
  const event: ShipmentEvent = {
    orderId: input.orderId,
    status: "VALIDATED",
    timestamp: Date.now(),
    details: {
      partId: input.partId,
      quantity: input.quantity,
      validatedAt: Date.now(),
    },
  };

  await sendToTopic(SHIPMENT_EVENTS_TOPIC, [
    {
      key: input.orderId,
      value: JSON.stringify(event),
    },
  ]);

  console.log(`✓ Emitted Kafka event for order: ${input.orderId}`);
}
