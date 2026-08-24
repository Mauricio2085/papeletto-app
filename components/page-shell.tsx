import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type PageShellProps = {
  children: ReactNode;
  showFooter?: boolean;
  className?: string;
};

export function PageShell({
  children,
  showFooter = true,
  className = "",
}: PageShellProps) {
  return (
    <div className={`flex min-h-full flex-1 flex-col ${className}`}>
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      {showFooter && <SiteFooter />}
    </div>
  );
}
