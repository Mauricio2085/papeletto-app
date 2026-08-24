import Link from "next/link";
import type { ReactNode } from "react";
import type { OrderStatus } from "@prisma/client";
import { ORDER_STATUS_LABELS } from "@/lib/orders/labels";

type AdminOrderFiltersProps = {
  activeStatus?: OrderStatus;
  todayOnly: boolean;
};

const QUICK_STATUSES: OrderStatus[] = [
  "QUOTED",
  "CONFIRMED",
  "SENT_TO_PRINTER",
  "READY",
  "COMPLETED",
  "FAILED",
];

function filterHref(status?: OrderStatus, today?: boolean): string {
  const params = new URLSearchParams();
  if (status) {
    params.set("status", status);
  }
  if (today) {
    params.set("today", "1");
  }
  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-brand/50 bg-brand/20 text-brand-bright"
          : "border-line bg-surface-raised/60 text-muted hover:border-brand/30 hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export function AdminOrderFilters({ activeStatus, todayOnly }: AdminOrderFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Estado
        </span>
        <FilterPill href={filterHref(undefined, todayOnly)} active={!activeStatus}>
          Todos
        </FilterPill>
        {QUICK_STATUSES.map((status) => (
          <FilterPill
            key={status}
            href={filterHref(status, todayOnly)}
            active={activeStatus === status}
          >
            {ORDER_STATUS_LABELS[status]}
          </FilterPill>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Fecha
        </span>
        <FilterPill href={filterHref(activeStatus, false)} active={!todayOnly}>
          Todos
        </FilterPill>
        <FilterPill href={filterHref(activeStatus, true)} active={todayOnly}>
          Hoy
        </FilterPill>
      </div>
    </div>
  );
}
