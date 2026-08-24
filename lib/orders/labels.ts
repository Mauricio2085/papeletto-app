import { OrderStatus, OrderType } from "@prisma/client";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: "Borrador",
  QUOTED: "Cotizado",
  CONFIRMED: "Confirmado",
  PROCESSING: "Procesando",
  SENT_TO_PRINTER: "En impresora",
  READY: "Listo",
  COMPLETED: "Completado",
  FAILED: "Fallido",
  CANCELLED: "Cancelado",
};

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  PRINT_STANDARD: "Impresión estándar",
  PRINT_SPECIAL: "Impresión especial",
  DOCUMENT_CV: "CV",
  DOCUMENT_DERECHO_PETICION: "Derecho de petición",
};

export const ORDER_STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  DRAFT: "border-line bg-surface-raised text-muted",
  QUOTED: "border-brand/40 bg-brand/15 text-brand-bright",
  CONFIRMED: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  PROCESSING: "border-violet-500/40 bg-violet-500/15 text-violet-300",
  SENT_TO_PRINTER: "border-violet-500/40 bg-violet-500/15 text-violet-300",
  READY: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  COMPLETED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400/80",
  FAILED: "border-red-500/40 bg-red-500/15 text-red-300",
  CANCELLED: "border-line bg-surface-raised text-muted",
};

export const ASSET_KIND_LABELS: Record<string, string> = {
  original: "Archivo subido",
  print_ready: "PDF para impresión",
  web_safe: "Export web",
  generated: "Generado",
};

export function assetKindLabel(kind: string): string {
  return ASSET_KIND_LABELS[kind] ?? kind;
}

export const PRINT_JOB_STATUS_LABELS: Record<string, string> = {
  PROCESSING: "Procesando",
  SENT: "Enviado",
  DRY_RUN: "Prueba (dry-run)",
  FAILED: "Fallido",
};

export function printJobStatusLabel(status: string): string {
  return PRINT_JOB_STATUS_LABELS[status] ?? status;
}
