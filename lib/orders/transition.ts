import { OrderStatus, type Order } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertTransition } from "@/lib/orders/transitions";

export async function transitionOrder(
  orderId: string,
  to: OrderStatus,
  expectedFrom?: OrderStatus | OrderStatus[],
): Promise<Order> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("Pedido no encontrado.");
  }

  if (expectedFrom) {
    const allowed = Array.isArray(expectedFrom) ? expectedFrom : [expectedFrom];
    if (!allowed.includes(order.status)) {
      throw new Error(
        `El pedido está en ${order.status}; se esperaba ${allowed.join(" o ")}.`,
      );
    }
  }

  assertTransition(order.status, to);

  return prisma.order.update({
    where: { id: orderId },
    data: { status: to },
  });
}
