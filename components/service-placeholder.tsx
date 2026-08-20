import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { PaperCard } from "@/components/paper-card";

type ServicePlaceholderProps = {
  title: string;
  description: string;
};

export function ServicePlaceholder({ title, description }: ServicePlaceholderProps) {
  return (
    <PageShell showFooter={false}>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted transition hover:text-brand-bright"
        >
          ← Volver al inicio
        </Link>

        <PaperCard glow className="space-y-4 p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-bright">
            En construcción
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="text-lg text-muted">{description}</p>
          <p className="rounded-xl border border-line bg-background/50 px-4 py-3 text-sm text-muted">
            Este flujo llegará en las siguientes fases. Mientras tanto, revisa{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 text-brand-bright">
              docs/specs/
            </code>
            .
          </p>
        </PaperCard>
      </div>
    </PageShell>
  );
}
