export const kafkaConfig = {
  brokers: [process.env.KAFKA_BROKER ?? "localhost:9092"],
  clientId: "shipment-service",
  topicShipmentEvents: process.env.KAFKA_TOPIC_SHIPMENT_EVENTS ?? "shipment-events",
};
