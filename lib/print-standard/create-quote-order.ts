import { randomUUID } from "node:crypto";
import { OrderStatus, OrderType } from "@prisma/client";
import { convertDocxToPdf } from "@/lib/gotenberg/client";
import { prisma } from "@/lib/prisma";
import { isDocxMime } from "@/lib/print-standard/constants";
import { countPages, countPdfPages } from "@/lib/print-standard/page-count";
import {
  calculateQuote,
  getUnitPriceCents,
  quoteToSnapshot,
  type StandardPrintQuote,
} from "@/lib/print-standard/pricing";
import { saveAssetBuffer } from "@/lib/storage/local";

export type CreateQuoteInput = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  byteSize: number;
  copies: number;
};

export type CreateQuoteResult = {
  orderId: string;
  quote: StandardPrintQuote;
  filename: string;
};

export async function createStandardPrintQuoteOrder(
  input: CreateQuoteInput,
): Promise<CreateQuoteResult> {
  let pageCount: number;
  let printReadyPdf: Buffer | null = null;
  let printReadyFilename: string | null = null;

  if (isDocxMime(input.mimeType)) {
    printReadyPdf = await convertDocxToPdf(input.buffer, input.filename);
    pageCount = await countPdfPages(printReadyPdf);
    printReadyFilename = input.filename.replace(/\.docx$/i, "") + ".pdf";
  } else {
    pageCount = await countPages(input.buffer, input.mimeType);
  }

  const unitPriceCents = await getUnitPriceCents();
  const quote = calculateQuote(pageCount, input.copies, unitPriceCents);
  const pricingSnapshot = quoteToSnapshot(quote);

  const order = await prisma.order.create({
    data: {
      type: OrderType.PRINT_STANDARD,
      status: OrderStatus.QUOTED,
      subtotalCents: quote.subtotalCents,
      totalCents: quote.totalCents,
      pricingSnapshot,
      metadata: {
        filename: input.filename,
        copies: input.copies,
        mimeType: input.mimeType,
      },
    },
  });

  const originalKey = `orders/${order.id}/${randomUUID()}-${input.filename}`;

  try {
    await saveAssetBuffer(originalKey, input.buffer);
    await prisma.asset.create({
      data: {
        orderId: order.id,
        kind: "original",
        filename: input.filename,
        mimeType: input.mimeType,
        byteSize: input.byteSize,
        storageKey: originalKey,
        pageCount,
      },
    });

    if (printReadyPdf && printReadyFilename) {
      const printKey = `orders/${order.id}/${randomUUID()}-${printReadyFilename}`;
      await saveAssetBuffer(printKey, printReadyPdf);
      await prisma.asset.create({
        data: {
          orderId: order.id,
          kind: "print_ready",
          filename: printReadyFilename,
          mimeType: "application/pdf",
          byteSize: printReadyPdf.byteLength,
          storageKey: printKey,
          pageCount,
        },
      });
    }
  } catch (error) {
    await prisma.order.delete({ where: { id: order.id } }).catch(() => undefined);
    throw error;
  }

  return {
    orderId: order.id,
    quote,
    filename: input.filename,
  };
}
