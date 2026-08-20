import Link from "next/link";

type SiteFooterProps = {
  className?: string;
};

export function SiteFooter({ className = "" }: SiteFooterProps) {
  return (
    <footer
      className={`border-t border-line/60 bg-surface/50 px-6 py-8 text-center text-sm text-muted ${className}`}
    >
      <p>
        Papeletto · Impresión y documentos ·{" "}
        <Link href="/" className="text-brand-bright hover:underline">
          Inicio
        </Link>
      </p>
    </footer>
  );
}
