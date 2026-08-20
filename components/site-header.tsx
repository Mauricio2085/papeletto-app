import Link from "next/link";
import { PapelettoLogo } from "@/components/papeletto-logo";

type SiteHeaderProps = {
  showAdmin?: boolean;
};

export function SiteHeader({ showAdmin = true }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group transition hover:opacity-90">
          <PapelettoLogo variant="header" priority />
        </Link>

        {showAdmin && (
          <Link
            href="/admin"
            className="rounded-full border border-line bg-surface-raised px-4 py-1.5 text-sm font-medium text-muted transition hover:border-brand/40 hover:text-brand-bright"
          >
            Admin
          </Link>
        )}
      </div>
    </header>
  );
}
