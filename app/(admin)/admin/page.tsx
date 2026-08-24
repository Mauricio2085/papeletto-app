import { PaperCard } from "@/components/paper-card";
import { AdminOrderFilters } from "@/components/admin-order-filters";
import { AdminOrdersTable } from "@/components/admin-orders-table";
import { auth } from "@/lib/auth";
import { listOrders, parseOrderStatusParam } from "@/lib/orders/queries";

type AdminPageProps = {
  searchParams: Promise<{ status?: string; today?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await auth();
  const { status: statusParam, today: todayParam } = await searchParams;

  const activeStatus = parseOrderStatusParam(statusParam);
  const todayOnly = todayParam === "1";

  const orders = await listOrders({
    status: activeStatus,
    today: todayOnly,
  });

  const filterParts: string[] = [];
  if (activeStatus) {
    filterParts.push(`estado ${activeStatus.toLowerCase()}`);
  }
  if (todayOnly) {
    filterParts.push("hoy");
  }
  const filterLabel = filterParts.length > 0 ? filterParts.join(" · ") : "todos";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-bright">
          Panel staff · {session?.user.role}
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Pedidos</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Bienvenido{session?.user.name ? `, ${session.user.name}` : ""}. Revisa cotizaciones
          y el estado de cada pedido.
        </p>
      </div>

      <PaperCard className="space-y-6 p-6 lg:p-8">
        <AdminOrderFilters activeStatus={activeStatus} todayOnly={todayOnly} />

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            {orders.length} pedido{orders.length === 1 ? "" : "s"} · {filterLabel}
          </p>
        </div>

        <AdminOrdersTable orders={orders} />
      </PaperCard>
    </div>
  );
}
