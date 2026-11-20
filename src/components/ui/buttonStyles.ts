const base =
  "inline-flex items-center justify-center gap-3 rounded-full border px-7 py-3.5 text-sm font-medium uppercase tracking-[0.16em] transition-[background-color,color,border-color,transform] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-45";

const variants = {
  solid:
    "border-ink bg-ink text-paper hover:border-accent hover:bg-accent active:translate-y-px",
  outline:
    "border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-paper active:translate-y-px",
  quiet:
    "border-transparent bg-transparent px-2 text-ink hover:text-accent active:translate-y-px",
} as const;

export type ButtonVariant = keyof typeof variants;

export function buttonClasses(
  variant: ButtonVariant = "solid",
  className = "",
): string {
  return `${base} ${variants[variant]} ${className}`;
}
