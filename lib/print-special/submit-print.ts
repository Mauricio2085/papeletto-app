import { OrderStatus, OrderType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { transitionOrder } from "@/lib/orders/transition";
import { parseOrderMetadata, parseSpecialPrintSnapshot } from "@/lib/orders/parse";
import { submitPrintJob } from "@/lib/printnode/client";
import {
  parsePrinterId,
  resolveDefaultPrinter,
} from "@/lib/printnode/resolve-printer";
import { readAssetBuffer } from "@/lib/storage/local";

export type SpecialSubmitPrintResult = {
  orderId: string;
  status: OrderStatus;
  printJobId: string;
  printNodeJobId: string | null;
  dryRun: boolean;
  error?: string;
};

/**
 * Assumes order is CONFIRMED or FAILED (retry).
 * Moves to PROCESSING → SENT_TO_PRINTER, or FAILED on error.
 */
export async function submitSpecialPrintJob(
  orderId: string,
): Promise<SpecialSubmitPrintResult> {
  const current = await prisma.order.findUnique({
    where: { id: orderId },
    include: { assets: true },
  });
  if (!current) {
    throw new Error("Pedido no encontrado.");
  }
  if (current.type !== OrderType.PRINT_SPECIAL) {
    throw new Error("Pedido de impresión especial no encontrado.");
  }

  if (
    current.status !== OrderStatus.CONFIRMED &&
    current.status !== OrderStatus.FAILED
  ) {
    throw new Error(
      `No se puede enviar a imprimir desde estado ${current.status}.`,
    );
  }

  const snapshot = parseSpecialPrintSnapshot(current.pricingSnapshot);
  const metadata = parseOrderMetadata(current.metadata);
  const copies = snapshot?.quantity ?? metadata.quantity ?? metadata.copies ?? 1;

  const printReady = current.assets.find((a) => a.kind === "print_ready");
  if (!printReady) {
    throw new Error("El pedido no tiene PDF print-ready.");
  }

  let printerId = "unknown";
  let printJobId = "";

  try {
    const printer = await resolveDefaultPrinter();
    printerId = printer.printNodePrinterId;
    const printerIdNum = parsePrinterId(printer.printNodePrinterId);
    const pdfBuffer = await readAssetBuffer(printReady.storageKey);

    await transitionOrder(orderId, OrderStatus.PROCESSING, [
      OrderStatus.CONFIRMED,
      OrderStatus.FAILED,
    ]);

    const printJob = await prisma.printJob.create({
      data: {
        orderId,
        printerId,
        copies,
        status: "PROCESSING",
        options: {
          source: "special-print",
          paperSize: metadata.paperSize ?? snapshot?.paperSize,
          layoutPreset: metadata.layoutPreset ?? snapshot?.layoutPreset,
        },
      },
    });
    printJobId = printJob.id;

    const result = await submitPrintJob({
      printerId: printerIdNum,
      title: `Papeletto · ${printReady.filename}`,
      contentType: "pdf_base64",
      content: pdfBuffer.toString("base64"),
      qty: copies,
      source: "papeletto-app/impresion-especial",
    });

    await prisma.printJob.update({
      where: { id: printJob.id },
      data: {
        printNodeJobId: result.jobId,
        status: result.dryRun ? "DRY_RUN" : "SENT",
        lastError: null,
      },
    });

    await transitionOrder(orderId, OrderStatus.SENT_TO_PRINTER, OrderStatus.PROCESSING);

    return {
      orderId,
      status: OrderStatus.SENT_TO_PRINTER,
      printJobId: printJob.id,
      printNodeJobId: result.jobId,
      dryRun: result.dryRun,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al enviar a PrintNode.";

    if (printJobId) {
      await prisma.printJob.update({
        where: { id: printJobId },
        data: { status: "FAILED", lastError: message },
      });
    } else {
      await prisma.printJob.create({
        data: {
          orderId,
          printerId,
          copies,
          status: "FAILED",
          lastError: message,
        },
      });
    }

    const latest = await prisma.order.findUnique({ where: { id: orderId } });
    if (latest?.status === OrderStatus.PROCESSING) {
      await transitionOrder(orderId, OrderStatus.FAILED, OrderStatus.PROCESSING);
    } else if (latest?.status === OrderStatus.CONFIRMED) {
      await transitionOrder(orderId, OrderStatus.FAILED, OrderStatus.CONFIRMED);
    }

    return {
      orderId,
      status: OrderStatus.FAILED,
      printJobId,
      printNodeJobId: null,
      dryRun: false,
      error: message,
    };
  }
}
