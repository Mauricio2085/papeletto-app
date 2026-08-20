export const metadata = { title: "Admin" };

export default function AdminPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-4xl text-brand-ink">Admin Papeletto</h1>
      <p className="text-muted">
        Panel de pedidos, precios, impresoras y reintentos. Auth y listados llegan en
        Phase 1.
      </p>
      <ul className="list-disc space-y-2 pl-5 text-sm text-muted">
        <li>Pedidos por estado</li>
        <li>PriceConfig / PrinterConfig</li>
        <li>Reintento de PrintJob fallidos</li>
      </ul>
    </div>
  );
}
