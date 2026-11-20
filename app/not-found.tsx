import Link from "next/link";
import Container from "@/components/ui/Container";
import type { Metadata } from "next";
import { buttonClasses } from "@/components/ui/buttonStyles";

// Next.js añade `<meta name="robots" content="noindex">` a las respuestas 404.
export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] items-center py-20">
      <Container>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">
          Error 404
        </p>
        <p
          aria-hidden="true"
          className="mb-8 font-sans text-[clamp(6rem,24vw,18rem)] leading-[0.8] font-semibold tracking-[-0.06em] text-ink/15"
        >
          404
        </p>
        <h1 className="mt-2 font-display text-h1 text-balance text-ink">
          Esta pieza no está en el catálogo.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          La página que buscas no existe o ha cambiado de sitio. Vuelve al
          inicio o explora los instrumentos que sí están en el taller.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/" className={buttonClasses("solid")}>
            Ir al inicio
          </Link>
          <Link href="/catalogo" className={buttonClasses("outline")}>
            Ver el catálogo
          </Link>
        </div>
      </Container>
    </section>
  );
}
