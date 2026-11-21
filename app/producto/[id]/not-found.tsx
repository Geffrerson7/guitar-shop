import Link from "next/link";
import LinkSpinner from "@/components/LinkSpinner";
import Container from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/buttonStyles";

// Se muestra con `notFound()` desde el detalle: responde 404 real
// (antes era un 200 con este mismo mensaje).
export default function ProductoNotFound() {
  return (
    <Container className="py-24">
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">
        02 — Detalle
      </p>
      <h1 className="mt-6 max-w-3xl font-display text-h1 text-balance text-ink">
        Esta pieza ya no está en el taller.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-ink-soft">
        Puede que se haya vendido o que el enlace no sea correcto. Te esperamos
        en el catálogo.
      </p>
      <Link href="/catalogo" className={`${buttonClasses("outline")} mt-10`}>
        <LinkSpinner>← Volver al catálogo</LinkSpinner>
      </Link>
    </Container>
  );
}
