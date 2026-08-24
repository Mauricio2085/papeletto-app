import Link from "next/link";
import { PapelettoLogo } from "@/components/papeletto-logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group transition hover:opacity-90">
          <PapelettoLogo variant="header" priority />
        </Link>
      </div>
    </header>
  );
}
