import { OrderStatus, type Order } from "@prisma/client";
import { transitionOrder } from "@/lib/orders/transition";

type FulfillmentOrder = Pick<Order, "status">;

export function canMarkOrderReady(order: FulfillmentOrder): boolean {
  return order.status === OrderStatus.SENT_TO_PRINTER;
}

export function canMarkOrderCompleted(order: FulfillmentOrder): boolean {
  return order.status === OrderStatus.READY;
}

export async function markOrderReady(orderId: string) {
  return transitionOrder(orderId, OrderStatus.READY, OrderStatus.SENT_TO_PRINTER);
}

export async function markOrderCompleted(orderId: string) {
  return transitionOrder(orderId, OrderStatus.COMPLETED, OrderStatus.READY);
}
