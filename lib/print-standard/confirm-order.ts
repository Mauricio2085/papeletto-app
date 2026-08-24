import { OrderStatus, OrderType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { transitionOrder } from "@/lib/orders/transition";
import {
  submitStandardPrintJob,
  type SubmitPrintResult,
} from "@/lib/print-standard/submit-print";

export type ConfirmAndPrintResult = SubmitPrintResult & {
  confirmed: boolean;
};

/**
 * Client confirm: QUOTED → CONFIRMED → print submit.
 */
export async function confirmAndPrintStandardOrder(
  orderId: string,
): Promise<ConfirmAndPrintResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("Pedido no encontrado.");
  }
  if (order.type !== OrderType.PRINT_STANDARD) {
    throw new Error("Este pedido no es de impresión estándar.");
  }
  if (order.status !== OrderStatus.QUOTED) {
    throw new Error(
      `Solo se pueden confirmar pedidos cotizados. Estado actual: ${order.status}.`,
    );
  }

  await transitionOrder(orderId, OrderStatus.CONFIRMED, OrderStatus.QUOTED);
  const printResult = await submitStandardPrintJob(orderId);

  return {
    ...printResult,
    confirmed: true,
  };
}

/**
 * Normalize orphan states (CONFIRMED/PROCESSING + failed PrintJob) to FAILED,
 * then submit again.
 */
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
  if (order.type !== OrderType.PRINT_STANDARD) {
    throw new Error("Este pedido no es de impresión estándar.");
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

/**
 * Staff retry: FAILED → PROCESSING → PrintNode again.
 * Also recovers CONFIRMED/PROCESSING when a PrintJob already failed.
 */
export async function retryStandardPrintOrder(
  orderId: string,
): Promise<SubmitPrintResult> {
  await ensureFailedBeforeRetry(orderId);
  return submitStandardPrintJob(orderId);
}
