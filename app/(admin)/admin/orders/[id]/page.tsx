import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminAssetPreview } from "@/components/admin-asset-preview";
import { AdminStaffAction } from "@/components/admin-staff-action";
import { PaperCard } from "@/components/paper-card";
import { formatDateTimeBogota } from "@/lib/format/datetime";
import { formatCop } from "@/lib/format/currency";
import {
  canMarkOrderCompleted,
  canMarkOrderReady,
} from "@/lib/orders/fulfillment";
import {
  canPrintStandardOrder,
  canRetryStandardPrint,
} from "@/lib/orders/can-retry";
import { getPrintPreviewAsset, visibleOrderAssets } from "@/lib/orders/assets";
import {
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  assetKindLabel,
  printJobStatusLabel,
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
  const displayAssets = visibleOrderAssets(order.assets);
  const previewAsset = getPrintPreviewAsset(order.assets);
  const showPrint = canPrintStandardOrder(order);
  const showRetry = canRetryStandardPrint(order);
  const showReady = canMarkOrderReady(order);
  const showCompleted = canMarkOrderCompleted(order);
  const showFulfillment = showReady || showCompleted;

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
              <dd
                className="max-w-[14rem] truncate font-medium text-foreground"
                title={originalAsset?.filename ?? metadata.filename}
              >
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
          {displayAssets.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Sin archivos adjuntos.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {displayAssets.map((asset) => (
                <li
                  key={asset.id}
                  className="rounded-xl border border-line bg-background/40 px-4 py-3 text-sm"
                >
                  <p className="font-medium text-foreground">{asset.filename}</p>
                  <p className="mt-1 text-xs text-muted">
                    {assetKindLabel(asset.kind)} · {asset.mimeType} ·{" "}
                    {asset.pageCount != null ? `${asset.pageCount} pág.` : "sin conteo"} ·{" "}
                    {(asset.byteSize / 1024).toFixed(1)} KB
                  </p>
                  <AdminAssetPreview
                    orderId={order.id}
                    assetId={asset.id}
                    filename={asset.filename}
                    mimeType={asset.mimeType}
                    kind={asset.kind}
                  />
                </li>
              ))}
            </ul>
          )}
        </PaperCard>
      </div>

      {(showPrint || showRetry || order.printJobs.length > 0) && (
        <PaperCard className="space-y-4 p-6">
          <div>
            <h2 className="text-lg font-semibold">Envíos a impresora</h2>
            <p className="mt-1 text-sm text-muted">
              El cliente autoriza la cotización; el staff envía a PrintNode desde aquí.
            </p>
          </div>

          {showPrint && (
            <div className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-4">
              <p className="mb-3 text-sm text-muted">
                Cotización autorizada por el cliente. Revisa el archivo, confirma el pago
                en mostrador y envía a imprimir.
              </p>
              {previewAsset && (
                <p className="mb-3 text-xs text-muted">
                  Vista previa del archivo a imprimir arriba en{" "}
                  <span className="text-foreground">{previewAsset.filename}</span>.
                </p>
              )}
              <AdminStaffAction orderId={order.id} mode="print" />
            </div>
          )}

          {order.printJobs.length > 0 ? (
            <ul className="space-y-3">
              {order.printJobs.map((job) => (
                <li
                  key={job.id}
                  className="rounded-xl border border-line bg-background/40 px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-foreground">
                      {printJobStatusLabel(job.status)}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDateTimeBogota(job.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {job.printNodeJobId
                      ? `PrintNode ${job.printNodeJobId}`
                      : `Local ${job.id.slice(-8)}`}
                    {" · "}
                    impresora {job.printerId}
                    {" · "}
                    {job.copies} copia{job.copies === 1 ? "" : "s"}
                  </p>
                  {job.lastError && (
                    <p className="mt-2 text-xs text-red-300">{job.lastError}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : !showPrint ? (
            <p className="text-sm text-muted">Aún no hay envíos registrados.</p>
          ) : null}

          {showRetry && (
            <div className="border-t border-line pt-4">
              <p className="mb-3 text-sm text-muted">
                Hay un fallo de impresión. Puedes volver a enviar el archivo a la
                impresora por defecto.
              </p>
              <AdminStaffAction orderId={order.id} mode="retry" />
            </div>
          )}
        </PaperCard>
      )}

      {showFulfillment && (
        <PaperCard className="space-y-4 p-6">
          <div>
            <h2 className="text-lg font-semibold">Entrega en mostrador</h2>
            <p className="mt-1 text-sm text-muted">
              Marca manualmente cuando el trabajo está listo para recoger y cuando el
              cliente se lo llevó.
            </p>
          </div>

          {showReady && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-4">
              <p className="mb-3 text-sm text-muted">
                El pedido ya salió a impresora. Marca listo cuando esté revisado y
                disponible para el cliente.
              </p>
              <AdminStaffAction orderId={order.id} mode="ready" />
            </div>
          )}

          {showCompleted && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-4">
              <p className="mb-3 text-sm text-muted">
                El cliente recogió el trabajo. Marca completado para cerrar el pedido.
              </p>
              <AdminStaffAction orderId={order.id} mode="completed" />
            </div>
          )}
        </PaperCard>
      )}
    </div>
  );
}
