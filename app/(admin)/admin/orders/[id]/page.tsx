import Link from "next/link";
import { notFound } from "next/navigation";
import { PaperCard } from "@/components/paper-card";
import { formatDateTimeBogota } from "@/lib/format/datetime";
import { formatCop } from "@/lib/format/currency";
import {
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
} from "@/lib/orders/labels";
import { parseOrderMetadata, parseStandardPrintSnapshot } from "@/lib/orders/parse";
import { getOrderById } from "@/lib/orders/queries";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return { title: `Pedido ${id.slice(-8)}` };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const snapshot = parseStandardPrintSnapshot(order.pricingSnapshot);
  const metadata = parseOrderMetadata(order.metadata);
  const originalAsset = order.assets.find((asset) => asset.kind === "original");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <Link
        href="/admin"
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted transition hover:text-brand-bright"
      >
        ← Volver al listado
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-bright">
            Detalle del pedido
          </p>
          <h1 className="mt-2 font-mono text-2xl font-bold sm:text-3xl">{order.id}</h1>
          <p className="mt-2 text-sm text-muted">
            Creado {formatDateTimeBogota(order.createdAt)}
            {order.updatedAt.getTime() !== order.createdAt.getTime() && (
              <> · Actualizado {formatDateTimeBogota(order.updatedAt)}</>
            )}
          </p>
        </div>
        <span
          className={[
            "inline-flex w-fit rounded-full border px-3 py-1 text-sm font-medium",
            ORDER_STATUS_BADGE_CLASS[order.status],
          ].join(" ")}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PaperCard className="p-6">
          <h2 className="text-lg font-semibold">Resumen</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Servicio</dt>
              <dd className="font-medium text-foreground">{ORDER_TYPE_LABELS[order.type]}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Archivo</dt>
              <dd className="max-w-[14rem] truncate font-medium text-foreground" title={originalAsset?.filename ?? metadata.filename}>
                {originalAsset?.filename ?? metadata.filename ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Páginas</dt>
              <dd className="font-medium text-foreground">
                {snapshot?.pageCount ?? originalAsset?.pageCount ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Copias</dt>
              <dd className="font-medium text-foreground">
                {snapshot?.copies ?? metadata.copies ?? "—"}
              </dd>
            </div>
            {snapshot && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Precio por página</dt>
                <dd className="font-medium text-foreground">
                  {formatCop(snapshot.unitPriceCents)}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4 border-t border-line pt-3">
              <dt className="text-muted">Total</dt>
              <dd className="text-lg font-bold text-brand-bright">
                {formatCop(order.totalCents)}
              </dd>
            </div>
          </dl>
        </PaperCard>

        <PaperCard className="p-6">
          <h2 className="text-lg font-semibold">Archivos</h2>
          {order.assets.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Sin archivos adjuntos.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {order.assets.map((asset) => (
                <li
                  key={asset.id}
                  className="rounded-xl border border-line bg-background/40 px-4 py-3 text-sm"
                >
                  <p className="font-medium text-foreground">{asset.filename}</p>
                  <p className="mt-1 text-xs text-muted">
                    {asset.kind} · {asset.mimeType} ·{" "}
                    {asset.pageCount != null ? `${asset.pageCount} pág.` : "sin conteo"} ·{" "}
                    {(asset.byteSize / 1024).toFixed(1)} KB
                  </p>
                </li>
              ))}
            </ul>
          )}
        </PaperCard>
      </div>

      {order.printJobs.length > 0 && (
        <PaperCard className="p-6">
          <h2 className="text-lg font-semibold">Print jobs</h2>
          <ul className="mt-4 space-y-3">
            {order.printJobs.map((job) => (
              <li
                key={job.id}
                className="rounded-xl border border-line bg-background/40 px-4 py-3 text-sm"
              >
                <p className="font-medium text-foreground">{job.status}</p>
                <p className="mt-1 font-mono text-xs text-muted">
                  {job.printNodeJobId ?? job.id}
                </p>
                {job.lastError && (
                  <p className="mt-2 text-xs text-red-300">{job.lastError}</p>
                )}
              </li>
            ))}
          </ul>
        </PaperCard>
      )}
    </div>
  );
}
