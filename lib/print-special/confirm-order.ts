import { OrderStatus, OrderType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { transitionOrder } from "@/lib/orders/transition";
import {
  submitSpecialPrintJob,
  type SpecialSubmitPrintResult,
} from "@/lib/print-special/submit-print";

export async function confirmSpecialPrintQuote(orderId: string): Promise<{
  orderId: string;
  status: OrderStatus;
}> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("Pedido no encontrado.");
  }
  if (order.type !== OrderType.PRINT_SPECIAL) {
    throw new Error("Este pedido no es de impresión especial.");
  }
  if (order.status !== OrderStatus.QUOTED) {
    throw new Error(
      `Solo se pueden confirmar pedidos cotizados. Estado actual: ${order.status}.`,
    );
  }

  const updated = await transitionOrder(
    orderId,
    OrderStatus.CONFIRMED,
    OrderStatus.QUOTED,
  );

  return { orderId: updated.id, status: updated.status };
}

export async function printSpecialOrder(
  orderId: string,
): Promise<SpecialSubmitPrintResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("Pedido no encontrado.");
  }
  if (order.type !== OrderType.PRINT_SPECIAL) {
    throw new Error("Este pedido no es de impresión especial.");
  }
  if (order.status !== OrderStatus.CONFIRMED) {
    throw new Error(
      `Solo se pueden imprimir pedidos confirmados. Estado actual: ${order.status}.`,
    );
  }

  return submitSpecialPrintJob(orderId);
}

async function ensureFailedBeforeRetry(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      printJobs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!order) {
    throw new Error("Pedido no encontrado.");
  }
  if (order.type !== OrderType.PRINT_SPECIAL) {
    throw new Error("Este pedido no es de impresión especial.");
  }

  if (order.status === OrderStatus.FAILED) {
    return;
  }

  const hasFailedJob = order.printJobs.some((job) => job.status === "FAILED");
  if (!hasFailedJob) {
    throw new Error(
      `Solo se pueden reintentar pedidos fallidos. Estado actual: ${order.status}.`,
    );
  }

  if (
    order.status === OrderStatus.CONFIRMED ||
    order.status === OrderStatus.PROCESSING
  ) {
    await transitionOrder(orderId, OrderStatus.FAILED, [
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
    ]);
    return;
  }

  throw new Error(
    `Solo se pueden reintentar pedidos fallidos. Estado actual: ${order.status}.`,
  );
}

export async function retrySpecialPrintOrder(
  orderId: string,
): Promise<SpecialSubmitPrintResult> {
  await ensureFailedBeforeRetry(orderId);
  return submitSpecialPrintJob(orderId);
}
