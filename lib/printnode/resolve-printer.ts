import { prisma } from "@/lib/prisma";

export type ResolvedPrinter = {
  printNodePrinterId: string;
  name: string;
  source: "env" | "db";
};

/**
 * Prefer PRINTNODE_DEFAULT_PRINTER_ID, else active PrinterConfig marked default.
 */
export async function resolveDefaultPrinter(): Promise<ResolvedPrinter> {
  const envId = process.env.PRINTNODE_DEFAULT_PRINTER_ID?.trim();
  if (envId) {
    return {
      printNodePrinterId: envId,
      name: "Impresora principal (env)",
      source: "env",
    };
  }

  const config = await prisma.printerConfig.findFirst({
    where: { active: true, isDefault: true },
  });

  if (!config) {
    throw new Error(
      "No hay impresora configurada. Define PRINTNODE_DEFAULT_PRINTER_ID o un PrinterConfig por defecto.",
    );
  }

  return {
    printNodePrinterId: config.printNodePrinterId,
    name: config.name,
    source: "db",
  };
}

export function parsePrinterId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`Id de impresora PrintNode inválido: ${raw}`);
  }
  return id;
}
