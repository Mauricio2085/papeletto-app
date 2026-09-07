import { prisma } from "@/lib/prisma";
import type { SpecialLayoutPresetId } from "@/lib/print-special/constants";
import { getSpecialLayoutPreset } from "@/lib/print-special/constants";
import type { PaperSize } from "@/lib/print/paper-sizes";

export type SpecialPrintQuote = {
  quantity: number;
  unitPriceCents: number;
  priceKey: string;
  layoutPreset: SpecialLayoutPresetId;
  paperSize: PaperSize;
  subtotalCents: number;
  totalCents: number;
};

export async function getSpecialUnitPriceCents(priceKey: string): Promise<number> {
  const config = await prisma.priceConfig.findFirst({
    where: { key: priceKey, active: true },
  });

  if (!config) {
    throw new Error(`Precio no configurado (${priceKey}). Ejecuta pnpm db:seed.`);
  }

  return config.amountCents;
}

export function calculateSpecialQuote(
  layoutPreset: SpecialLayoutPresetId,
  paperSize: PaperSize,
  quantity: number,
  unitPriceCents: number,
): SpecialPrintQuote {
  const preset = getSpecialLayoutPreset(layoutPreset);
  const subtotalCents = quantity * unitPriceCents;

  return {
    quantity,
    unitPriceCents,
    priceKey: preset.priceKey,
    layoutPreset,
    paperSize,
    subtotalCents,
    totalCents: subtotalCents,
  };
}

export function specialQuoteToSnapshot(quote: SpecialPrintQuote) {
  return {
    service: "PRINT_SPECIAL",
    priceKey: quote.priceKey,
    layoutPreset: quote.layoutPreset,
    paperSize: quote.paperSize,
    quantity: quote.quantity,
    unitPriceCents: quote.unitPriceCents,
    subtotalCents: quote.subtotalCents,
    totalCents: quote.totalCents,
    formula: "quantity * unitPriceCents",
  };
}
