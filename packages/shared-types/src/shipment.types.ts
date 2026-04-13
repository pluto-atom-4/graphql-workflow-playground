/**
 * Domain types for shipment workflow (Practice 1)
 */

export type ShipmentStatus =
  | "CREATED"
  | "VALIDATED"
  | "RESERVED"
  | "FULFILLED"
  | "SHIPPED"
  | "FAILED";

export interface ShipmentOrder {
  orderId: string;
  partId: string;
  quantity: number;
  timestamp: number; // Unix ms
}

export interface ValidateOrderResult {
  valid: boolean;
  orderId: string;
  reason?: string;
}

export interface ReserveInventoryResult {
  reserved: boolean;
  quantityReserved: number;
  location?: string;
  reason?: string;
}

export interface ShipmentEvent {
  orderId: string;
  status: ShipmentStatus;
  timestamp: number;
  details: {
    partId: string;
    quantity: number;
    validatedAt?: number;
    reservedAt?: number;
    shippedAt?: number;
  };
}
