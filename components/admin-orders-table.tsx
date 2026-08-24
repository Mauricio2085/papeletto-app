import Link from "next/link";
import type { OrderStatus, OrderType } from "@prisma/client";
import { formatDateTimeBogota } from "@/lib/format/datetime";
import { formatCop } from "@/lib/format/currency";
import {
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
} from "@/lib/orders/labels";
import { parseOrderMetadata, parseStandardPrintSnapshot } from "@/lib/orders/parse";
import type { OrderListItem } from "@/lib/orders/queries";

type AdminOrdersTableProps = {
  orders: OrderListItem[];
};

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        ORDER_STATUS_BADGE_CLASS[status],
      ].join(" ")}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

function resolveOrderSummary(order: OrderListItem) {
  const snapshot = parseStandardPrintSnapshot(order.pricingSnapshot);
  const metadata = parseOrderMetadata(order.metadata);
  const asset = order.assets[0];

  return {
    filename: asset?.filename ?? metadata.filename ?? "—",
    pageCount: snapshot?.pageCount ?? asset?.pageCount ?? null,
    copies: snapshot?.copies ?? metadata.copies ?? null,
  };
}

export function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center">
        <p className="text-sm font-medium text-foreground">No hay pedidos con estos filtros</p>
        <p className="mt-1 text-xs text-muted">
          Las cotizaciones de impresión estándar aparecerán aquí en estado Cotizado.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-raised/50 text-xs uppercase tracking-[0.12em] text-muted">
            <th className="px-4 py-3 font-semibold">Referencia</th>
            <th className="px-4 py-3 font-semibold">Servicio</th>
            <th className="px-4 py-3 font-semibold">Archivo</th>
            <th className="px-4 py-3 font-semibold">Págs.</th>
            <th className="px-4 py-3 font-semibold">Copias</th>
            <th className="px-4 py-3 font-semibold">Total</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Creado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((order) => {
            const summary = resolveOrderSummary(order);

            return (
              <tr
                key={order.id}
                className="bg-background/30 transition hover:bg-surface-hover/40"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono text-xs text-brand-bright hover:underline"
                  >
                    {order.id.slice(-8)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground">
                  {ORDER_TYPE_LABELS[order.type as OrderType]}
                </td>
                <td className="max-w-[12rem] truncate px-4 py-3 text-foreground" title={summary.filename}>
                  {summary.filename}
                </td>
                <td className="px-4 py-3 text-muted">
                  {summary.pageCount ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted">
                  {summary.copies ?? "—"}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {formatCop(order.totalCents)}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {formatDateTimeBogota(order.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
