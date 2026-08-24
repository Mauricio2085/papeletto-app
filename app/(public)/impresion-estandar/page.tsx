import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { PaperCard } from "@/components/paper-card";
import { StandardPrintForm } from "@/components/standard-print-form";

export const metadata = { title: "Impresión estándar" };

export default function ImpresionEstandarPage() {
  return (
    <PageShell showFooter={false}>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted transition hover:text-brand-bright"
        >
          ← Volver al inicio
        </Link>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-bright">
            Impresión estándar
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">Cotiza tu impresión</h1>
          <p className="text-muted">
            Sube un PDF o archivo de texto. Calculamos hojas × copias × precio y
            guardamos tu pedido.
          </p>
        </div>

        <PaperCard glow className="p-8 lg:p-10">
          <StandardPrintForm />
        </PaperCard>
      </div>
    </PageShell>
  );
}
