import { randomUUID } from "node:crypto";
import { OrderStatus, OrderType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { countPages } from "@/lib/print-standard/page-count";
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
  const pageCount = await countPages(input.buffer, input.mimeType);
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

  const storageKey = `orders/${order.id}/${randomUUID()}-${input.filename}`;

  try {
    await saveAssetBuffer(storageKey, input.buffer);
    await prisma.asset.create({
      data: {
        orderId: order.id,
        kind: "original",
        filename: input.filename,
        mimeType: input.mimeType,
        byteSize: input.byteSize,
        storageKey,
        pageCount,
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
  };
}
