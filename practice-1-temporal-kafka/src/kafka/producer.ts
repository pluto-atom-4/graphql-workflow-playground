import { Kafka } from "kafkajs";
import { kafkaConfig } from "../config/kafka.config";

let kafkaInstance: Kafka | null = null;

export function getKafkaInstance(): Kafka {
  if (!kafkaInstance) {
    kafkaInstance = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers,
    });
  }
  return kafkaInstance;
}

export async function createProducer() {
  const kafka = getKafkaInstance();
  const producer = kafka.producer();
  await producer.connect();
  return producer;
}

export async function sendToTopic(
  topic: string,
  messages: Array<{ key: string | null; value: string }>
): Promise<void> {
  const producer = await createProducer();
  try {
    await producer.send({
      topic,
      messages,
    });
    console.log(`✓ Sent ${messages.length} message(s) to topic: ${topic}`);
  } finally {
    await producer.disconnect();
  }
}
