import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/(admin)/actions";
import { PapelettoLogo } from "@/components/papeletto-logo";

type AdminShellProps = {
  children: ReactNode;
  userEmail?: string | null;
  userName?: string | null;
};

export function AdminShell({ children, userEmail, userName }: AdminShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-50 border-b border-line/80 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="transition hover:opacity-90">
              <PapelettoLogo variant="header" />
            </Link>
            <span className="hidden rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-bright sm:inline">
              Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right text-sm sm:block">
              <p className="font-medium text-foreground">{userName ?? "Staff"}</p>
              <p className="text-xs text-muted">{userEmail}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-line bg-surface-raised px-4 py-1.5 text-sm font-medium text-muted transition hover:border-brand/40 hover:text-brand-bright"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
