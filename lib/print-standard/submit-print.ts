import { randomUUID } from "node:crypto";
import { OrderStatus, OrderType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { transitionOrder } from "@/lib/orders/transition";
import { parseOrderMetadata, parseStandardPrintSnapshot } from "@/lib/orders/parse";
import { submitPrintJob } from "@/lib/printnode/client";
import {
  parsePrinterId,
  resolveDefaultPrinter,
} from "@/lib/printnode/resolve-printer";
import { textBufferToPdf } from "@/lib/print-standard/text-to-pdf";
import { readAssetBuffer, saveAssetBuffer } from "@/lib/storage/local";

export type SubmitPrintResult = {
  orderId: string;
  status: OrderStatus;
  printJobId: string;
  printNodeJobId: string | null;
  dryRun: boolean;
  error?: string;
};

async function ensurePrintReadyPdf(orderId: string): Promise<{
  pdfBuffer: Buffer;
  filename: string;
  copies: number;
}> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { assets: true },
  });

  if (!order || order.type !== OrderType.PRINT_STANDARD) {
    throw new Error("Pedido de impresión estándar no encontrado.");
  }

  const snapshot = parseStandardPrintSnapshot(order.pricingSnapshot);
  const metadata = parseOrderMetadata(order.metadata);
  const copies = snapshot?.copies ?? metadata.copies ?? 1;

  const printReady = order.assets.find((a) => a.kind === "print_ready");
  if (printReady) {
    return {
      pdfBuffer: await readAssetBuffer(printReady.storageKey),
      filename: printReady.filename,
      copies,
    };
  }

  const original = order.assets.find((a) => a.kind === "original");
  if (!original) {
    throw new Error("El pedido no tiene archivo original.");
  }

  const originalBuffer = await readAssetBuffer(original.storageKey);

  if (original.mimeType === "application/pdf") {
    // PDF subido ya es print-ready; no duplicar asset en DB/disco.
    return {
      pdfBuffer: originalBuffer,
      filename: original.filename,
      copies,
    };
  }

  const pdfBuffer = await textBufferToPdf(originalBuffer);
  const pdfFilename = original.filename.replace(/\.[^.]+$/, "") + ".pdf";
  const storageKey = `orders/${orderId}/${randomUUID()}-${pdfFilename}`;
  await saveAssetBuffer(storageKey, pdfBuffer);
  await prisma.asset.create({
    data: {
      orderId,
      kind: "print_ready",
      filename: pdfFilename,
      mimeType: "application/pdf",
      byteSize: pdfBuffer.byteLength,
      storageKey,
      pageCount: snapshot?.pageCount ?? original.pageCount,
    },
  });

  return { pdfBuffer, filename: pdfFilename, copies };
}

/**
 * Assumes order is CONFIRMED or FAILED (retry).
 * Moves to PROCESSING → SENT_TO_PRINTER, or FAILED on error.
 */
export async function submitStandardPrintJob(
  orderId: string,
): Promise<SubmitPrintResult> {
  const current = await prisma.order.findUnique({ where: { id: orderId } });
  if (!current) {
    throw new Error("Pedido no encontrado.");
  }

  if (
    current.status !== OrderStatus.CONFIRMED &&
    current.status !== OrderStatus.FAILED
  ) {
    throw new Error(
      `No se puede enviar a imprimir desde estado ${current.status}.`,
    );
  }

  let printerId = "unknown";
  let copies = 1;
  let printJobId = "";

  try {
    const printer = await resolveDefaultPrinter();
    printerId = printer.printNodePrinterId;
    const printerIdNum = parsePrinterId(printer.printNodePrinterId);
    const prepared = await ensurePrintReadyPdf(orderId);
    copies = prepared.copies;

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
        options: { source: "standard-print" },
      },
    });
    printJobId = printJob.id;

    const result = await submitPrintJob({
      printerId: printerIdNum,
      title: `Papeletto · ${prepared.filename}`,
      contentType: "pdf_base64",
      content: prepared.pdfBuffer.toString("base64"),
      qty: copies,
      source: "papeletto-app/impresion-estandar",
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
    // Already FAILED (retry prep failed): leave as FAILED

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
