import { Connection, Client } from "@temporalio/client";
import { temporalConfig } from "../config/temporal.config";

let clientInstance: Client | null = null;

export async function getTemporalClient(): Promise<Client> {
  if (!clientInstance) {
    const connection = await Connection.connect({
      address: temporalConfig.address,
    });

    clientInstance = new Client({
      connection,
      namespace: temporalConfig.namespace,
    });
  }
  return clientInstance;
}

export async function closeTemporalClient(): Promise<void> {
  if (clientInstance) {
    await clientInstance.connection.close();
    clientInstance = null;
  }
}
