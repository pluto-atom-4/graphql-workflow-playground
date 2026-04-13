import type { ReserveInventoryResult } from "@boltline/shared-types";

export interface ReserveInventoryInput {
  partId: string;
  quantity: number;
  orderId: string;
}

export async function reserveInventory(
  input: ReserveInventoryInput
): Promise<ReserveInventoryResult> {
  console.log(`Reserving inventory for order: ${input.orderId}`);

  // Simulate inventory check with potential transient failures
  if (Math.random() < 0.1) {
    throw new Error("Transient inventory service failure - will retry");
  }

  // In a real app, this would actually reserve inventory from the database
  return {
    reserved: true,
    quantityReserved: input.quantity,
    location: "Warehouse A",
  };
}
