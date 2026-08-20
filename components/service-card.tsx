import Link from "next/link";
import { PaperCard } from "@/components/paper-card";

const icons: Record<string, string> = {
  print: "🖨",
  photo: "🖼",
  cv: "📄",
  legal: "✍",
};

type ServiceCardProps = {
  href: string;
  title: string;
  description: string;
  icon: keyof typeof icons;
  tag?: string;
};

export function ServiceCard({ href, title, description, icon, tag }: ServiceCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <PaperCard className="flex h-full flex-col p-6 transition duration-300 group-hover:-translate-y-0.5 group-hover:border-brand/35 group-hover:bg-surface-hover">
        <div className="mb-4 flex items-start justify-between gap-3">
          <span
            className="flex size-11 items-center justify-center rounded-xl bg-brand/15 text-xl ring-1 ring-brand/25"
            aria-hidden
          >
            {icons[icon]}
          </span>
          {tag && (
            <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-bright ring-1 ring-brand/20">
              {tag}
            </span>
          )}
        </div>
        <h2 className="text-lg font-semibold text-foreground group-hover:text-brand-bright">
          {title}
        </h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{description}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand">
          Empezar
          <span className="transition group-hover:translate-x-0.5" aria-hidden>
            →
          </span>
        </span>
      </PaperCard>
    </Link>
  );
}
