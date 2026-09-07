import { OrderStatus, OrderType, type Order, type PrintJob } from "@prisma/client";

type PrintActionOrder = Pick<Order, "type" | "status"> & {
  printJobs?: Pick<PrintJob, "status">[];
};

function isPrintOrderType(type: OrderType): boolean {
  return type === OrderType.PRINT_STANDARD || type === OrderType.PRINT_SPECIAL;
}

function hasFailedPrintJob(order: PrintActionOrder): boolean {
  return (order.printJobs ?? []).some((job) => job.status === "FAILED");
}

/**
 * Staff can send to PrintNode when the client authorized the quote
 * and there is no failed print job pending retry.
 */
export function canPrintOrder(order: PrintActionOrder): boolean {
  return (
    isPrintOrderType(order.type) &&
    order.status === OrderStatus.CONFIRMED &&
    !hasFailedPrintJob(order)
  );
}

/** @deprecated Use canPrintOrder */
export function canPrintStandardOrder(order: PrintActionOrder): boolean {
  return canPrintOrder(order) && order.type === OrderType.PRINT_STANDARD;
}

/**
 * Staff can retry when the order is FAILED, or when a print job failed
 * but the order never reached FAILED (orphan CONFIRMED / PROCESSING).
 */
export function canRetryPrint(order: PrintActionOrder): boolean {
  if (!isPrintOrderType(order.type)) {
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

/** @deprecated Use canRetryPrint */
export function canRetryStandardPrint(order: PrintActionOrder): boolean {
  return canRetryPrint(order) && order.type === OrderType.PRINT_STANDARD;
}
