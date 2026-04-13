/**
 * Type definitions for Temporal workflow signals and queries (Practice 1)
 */

export interface WorkflowInput {
  orderId: string;
  partId: string;
  quantity: number;
}

export interface WorkflowSignal {
  type: "cancel" | "update";
  payload: unknown;
}

export interface WorkflowQuery {
  type: "status" | "history";
}

export interface WorkflowState {
  orderId: string;
  status: "started" | "validating" | "reserving" | "emitting" | "completed" | "failed";
  currentActivityName?: string;
  error?: string;
  startTime: number;
  updateTime: number;
}
