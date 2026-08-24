import { OrderStatus, OrderType, type Order, type PrintJob } from "@prisma/client";

type RetryableOrder = Pick<Order, "type" | "status"> & {
  printJobs: Pick<PrintJob, "status">[];
};

/**
 * Staff can retry when the order is FAILED, or when a print job failed
 * but the order never reached FAILED (orphan CONFIRMED / PROCESSING).
 */
export function canRetryStandardPrint(order: RetryableOrder): boolean {
  if (order.type !== OrderType.PRINT_STANDARD) {
    return false;
  }

  if (order.status === OrderStatus.FAILED) {
    return true;
  }

  const hasFailedJob = order.printJobs.some((job) => job.status === "FAILED");
  if (!hasFailedJob) {
    return false;
  }

  return (
    order.status === OrderStatus.CONFIRMED ||
    order.status === OrderStatus.PROCESSING
  );
}
