export default function PageTitle({
  eyebrow,
  title,
  intro,
  className = "",
  children,
}) {
  return (
    <header className={`max-w-5xl ${className}`}>
      {eyebrow && (
        <p className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-accent">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-h1 text-balance text-ink">{title}</h1>
      {intro && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
          {intro}
        </p>
      )}
      {children}
    </header>
  );
}
