import { OrderStatus } from "@prisma/client";

export class OrderTransitionError extends Error {
  constructor(
    message: string,
    readonly from: OrderStatus,
    readonly to: OrderStatus,
  ) {
    super(message);
    this.name = "OrderTransitionError";
  }
}

/** Allowed next statuses for each current status (MVP impresión estándar). */
const ALLOWED: Record<OrderStatus, readonly OrderStatus[]> = {
  DRAFT: [OrderStatus.QUOTED, OrderStatus.CANCELLED],
  QUOTED: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.FAILED, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.SENT_TO_PRINTER, OrderStatus.FAILED],
  SENT_TO_PRINTER: [OrderStatus.READY, OrderStatus.FAILED],
  READY: [OrderStatus.COMPLETED],
  COMPLETED: [],
  FAILED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  CANCELLED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED[from].includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new OrderTransitionError(
      `Transición no permitida: ${from} → ${to}`,
      from,
      to,
    );
  }
}

export function allowedTransitions(from: OrderStatus): readonly OrderStatus[] {
  return ALLOWED[from];
}
