import Link from "next/link";

type ServicePlaceholderProps = {
  title: string;
  description: string;
};

export function ServicePlaceholder({ title, description }: ServicePlaceholderProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <Link href="/" className="text-sm font-medium text-muted hover:text-brand-ink">
        ← Volver a Papeletto
      </Link>
      <div className="space-y-3 rounded-2xl border border-line bg-surface/80 p-8">
        <h1 className="text-4xl text-brand-ink">{title}</h1>
        <p className="text-muted">{description}</p>
        <p className="text-sm text-muted">
          Flujo en construcción. Ver specs en <code>docs/specs/</code>.
        </p>
      </div>
    </div>
  );
}
