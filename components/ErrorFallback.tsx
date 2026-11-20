import Container from "./ui/Container";
import Button from "./ui/Button";
import { buttonClasses } from "./ui/buttonStyles";

type ErrorFallbackProps = {
  onRetry: () => void;
};

/** Contenido común de `error.tsx` y `global-error.tsx`. */
export default function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  return (
    <section className="flex min-h-[70svh] items-center py-24">
      <Container>
        <p className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-accent">
          Error inesperado
        </p>
        <h1 className="max-w-3xl font-display text-h1 text-balance">
          Algo se ha desafinado.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink-soft">
          No hemos podido mostrar esta página. Puedes intentarlo de nuevo o
          volver al inicio mientras lo revisamos.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button onClick={onRetry}>Reintentar</Button>
          {/* Recarga completa a propósito: sale de un árbol en estado de error. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className={buttonClasses("outline")}>
            Volver al inicio
          </a>
        </div>
      </Container>
    </section>
  );
}
