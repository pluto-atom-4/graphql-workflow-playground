/**
 * Re-export types from shared packages
 * In practice, after codegen runs, this would also re-export generated GraphQL types
 */

export type {
  Order,
  OrderStatus,
  Part,
  InventoryItem,
  PlaceOrderInput,
} from "@boltline/shared-types";
