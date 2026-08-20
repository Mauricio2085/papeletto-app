import type { ReactNode } from "react";

type PaperCardProps = {
  children: ReactNode;
  className?: string;
  fold?: boolean;
  glow?: boolean;
};

export function PaperCard({
  children,
  className = "",
  fold = true,
  glow = false,
}: PaperCardProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-line bg-surface-raised/90 backdrop-blur-sm",
        fold ? "paper-fold" : "",
        glow ? "glow-ring" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
