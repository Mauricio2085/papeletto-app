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
  available?: boolean;
};

export function ServiceCard({
  href,
  title,
  description,
  icon,
  tag,
  available = true,
}: ServiceCardProps) {
  const content = (
    <PaperCard
      className={[
        "flex h-full flex-col p-6 transition duration-300",
        available
          ? "group-hover:-translate-y-0.5 group-hover:border-brand/35 group-hover:bg-surface-hover"
          : "cursor-not-allowed opacity-70",
      ].join(" ")}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className={[
            "flex size-11 items-center justify-center rounded-xl text-xl ring-1",
            available
              ? "bg-brand/15 ring-brand/25"
              : "bg-surface-hover ring-line",
          ].join(" ")}
          aria-hidden
        >
          {icons[icon]}
        </span>
        {!available ? (
          <span className="badge-soon shrink-0">Próximamente</span>
        ) : (
          tag && (
            <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-bright ring-1 ring-brand/20">
              {tag}
            </span>
          )
        )}
      </div>
      <h2
        className={[
          "text-lg font-semibold",
          available ? "text-foreground group-hover:text-brand-bright" : "text-muted",
        ].join(" ")}
      >
        {title}
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{description}</p>
      {available ? (
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand">
          Empezar
          <span className="transition group-hover:translate-x-0.5" aria-hidden>
            →
          </span>
        </span>
      ) : (
        <span className="mt-5 text-sm font-semibold text-brand-bright">Disponible pronto</span>
      )}
    </PaperCard>
  );

  if (!available) {
    return (
      <div className="block h-full" aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className="group block h-full">
      {content}
    </Link>
  );
}
