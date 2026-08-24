import { prisma } from "@/lib/prisma";
import { STANDARD_PRINT_PRICE_KEY } from "@/lib/print-standard/constants";

export type StandardPrintQuote = {
  pageCount: number;
  copies: number;
  unitPriceCents: number;
  priceKey: string;
  subtotalCents: number;
  totalCents: number;
};

export async function getUnitPriceCents(
  priceKey: string = STANDARD_PRINT_PRICE_KEY,
): Promise<number> {
  const config = await prisma.priceConfig.findFirst({
    where: { key: priceKey, active: true },
  });

  if (!config) {
    throw new Error(`Precio no configurado (${priceKey}). Ejecuta pnpm db:seed.`);
  }

  return config.amountCents;
}

export function calculateQuote(
  pageCount: number,
  copies: number,
  unitPriceCents: number,
  priceKey: string = STANDARD_PRINT_PRICE_KEY,
): StandardPrintQuote {
  const subtotalCents = pageCount * copies * unitPriceCents;

  return {
    pageCount,
    copies,
    unitPriceCents,
    priceKey,
    subtotalCents,
    totalCents: subtotalCents,
  };
}

export function quoteToSnapshot(quote: StandardPrintQuote) {
  return {
    service: "PRINT_STANDARD",
    priceKey: quote.priceKey,
    pageCount: quote.pageCount,
    copies: quote.copies,
    unitPriceCents: quote.unitPriceCents,
    subtotalCents: quote.subtotalCents,
    totalCents: quote.totalCents,
    formula: "pageCount * copies * unitPriceCents",
  };
}
