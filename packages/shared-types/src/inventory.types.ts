/**
 * Domain types for inventory management (Practice 2 & 3)
 */

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Part {
  id: string;
  name: string;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  partId: string;
  quantity: number;
  location: string;
  part?: Part;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  partId: string;
  quantity: number;
  status: OrderStatus;
  part?: Part;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceOrderInput {
  partId: string;
  quantity: number;
}

export interface PlaceOrderResponse {
  orderId: string;
  status: OrderStatus;
  message: string;
}
