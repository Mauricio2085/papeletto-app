import Image from "next/image";

const LOGO_SRC = "/papeletto-logo.jpg";
const ASPECT = 1024 / 409;

type PapelettoLogoProps = {
  variant?: "header" | "hero";
  className?: string;
  priority?: boolean;
};

export function PapelettoLogo({
  variant = "header",
  className = "",
  priority = false,
}: PapelettoLogoProps) {
  const height = variant === "hero" ? 120 : 36;
  const width = Math.round(height * ASPECT);

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-white/20",
        variant === "header" ? "px-2 py-1" : "px-5 py-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        src={LOGO_SRC}
        alt="Papeletto"
        width={width}
        height={height}
        priority={priority}
        unoptimized
        className="h-auto w-auto object-contain"
        style={{ width, height: "auto", maxHeight: height }}
      />
    </span>
  );
}
