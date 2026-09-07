import { randomUUID } from "node:crypto";
import { OrderStatus, OrderType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PaperSize } from "@/lib/print/paper-sizes";
import {
  getSpecialLayoutPreset,
  type SpecialLayoutPresetId,
} from "@/lib/print-special/constants";
import { buildSpecialPrintReadyPdf } from "@/lib/print-special/print-ready";
import {
  calculateSpecialQuote,
  getSpecialUnitPriceCents,
  specialQuoteToSnapshot,
  type SpecialPrintQuote,
} from "@/lib/print-special/pricing";
import { saveAssetBuffer } from "@/lib/storage/local";

export type CreateSpecialQuoteInput = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  byteSize: number;
  quantity: number;
  paperSize: PaperSize;
  layoutPreset: SpecialLayoutPresetId;
};

export type CreateSpecialQuoteResult = {
  orderId: string;
  quote: SpecialPrintQuote;
  filename: string;
  layoutPresetLabel: string;
  paperSize: PaperSize;
};

export async function createSpecialPrintQuoteOrder(
  input: CreateSpecialQuoteInput,
): Promise<CreateSpecialQuoteResult> {
  const preset = getSpecialLayoutPreset(input.layoutPreset);
  if (!preset.paperSizes.includes(input.paperSize)) {
    throw new Error("Elige carta u oficio para este layout.");
  }

  const printReady = await buildSpecialPrintReadyPdf({
    imageBuffer: input.buffer,
    originalFilename: input.filename,
    layoutPreset: input.layoutPreset,
    paperSize: input.paperSize,
  });

  const unitPriceCents = await getSpecialUnitPriceCents(preset.priceKey);
  const quote = calculateSpecialQuote(
    input.layoutPreset,
    input.paperSize,
    input.quantity,
    unitPriceCents,
  );
  const pricingSnapshot = specialQuoteToSnapshot(quote);

  const order = await prisma.order.create({
    data: {
      type: OrderType.PRINT_SPECIAL,
      status: OrderStatus.QUOTED,
      subtotalCents: quote.subtotalCents,
      totalCents: quote.totalCents,
      pricingSnapshot,
      metadata: {
        filename: input.filename,
        quantity: input.quantity,
        copies: input.quantity,
        mimeType: input.mimeType,
        paperSize: input.paperSize,
        layoutPreset: input.layoutPreset,
        layoutPresetLabel: preset.label,
      },
    },
  });

  const originalKey = `orders/${order.id}/${randomUUID()}-${input.filename}`;
  const printKey = `orders/${order.id}/${randomUUID()}-${printReady.filename}`;

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
        pageCount: 1,
      },
    });

    await saveAssetBuffer(printKey, printReady.pdfBuffer);
    await prisma.asset.create({
      data: {
        orderId: order.id,
        kind: "print_ready",
        filename: printReady.filename,
        mimeType: "application/pdf",
        byteSize: printReady.pdfBuffer.byteLength,
        storageKey: printKey,
        pageCount: 1,
      },
    });
  } catch (error) {
    await prisma.order.delete({ where: { id: order.id } }).catch(() => undefined);
    throw error;
  }

  return {
    orderId: order.id,
    quote,
    filename: input.filename,
    layoutPresetLabel: preset.label,
    paperSize: input.paperSize,
  };
}
