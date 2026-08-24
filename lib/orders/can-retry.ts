import { OrderStatus, OrderType, type Order, type PrintJob } from "@prisma/client";

type PrintActionOrder = Pick<Order, "type" | "status"> & {
  printJobs?: Pick<PrintJob, "status">[];
};

function hasFailedPrintJob(order: PrintActionOrder): boolean {
  return (order.printJobs ?? []).some((job) => job.status === "FAILED");
}

/**
 * Staff can send to PrintNode when the client authorized the quote
 * and there is no failed print job pending retry.
 */
export function canPrintStandardOrder(order: PrintActionOrder): boolean {
  return (
    order.type === OrderType.PRINT_STANDARD &&
    order.status === OrderStatus.CONFIRMED &&
    !hasFailedPrintJob(order)
  );
}

/**
 * Staff can retry when the order is FAILED, or when a print job failed
 * but the order never reached FAILED (orphan CONFIRMED / PROCESSING).
 */
export function canRetryStandardPrint(order: PrintActionOrder): boolean {
  if (order.type !== OrderType.PRINT_STANDARD) {
    return false;
  }

  if (order.status === OrderStatus.FAILED) {
    return true;
  }

  if (!hasFailedPrintJob(order)) {
    return false;
  }

  return (
    order.status === OrderStatus.CONFIRMED ||
    order.status === OrderStatus.PROCESSING
  );
}
