interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}

export default function SectionHeading({ title, subtitle, align = "center" }: SectionHeadingProps) {
  return (
    <div className={`mb-12 ${align === "center" ? "text-center" : "text-left"}`}>
      {subtitle && (
        <p className="text-[var(--brand-red)] text-xs font-semibold uppercase tracking-[0.2em] mb-3">
          {subtitle}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] leading-tight">{title}</h2>
      <div className={`h-px w-12 bg-[var(--brand-red)] opacity-40 mt-5 ${align === "center" ? "mx-auto" : ""}`} />
    </div>
  );
}
