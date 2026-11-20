import Link from "next/link";
import Container from "./ui/Container";

const categorias = [
  "Guitarras eléctricas",
  "Guitarras acústicas",
  "Bajos",
  "Amplificadores",
];

const servicios = [
  "Taller de luthier",
  "Tasaciones vintage",
  "Custom Shop",
  "Clínicas",
];

const enlaceFooter =
  "inline-block rounded-sm text-paper/80 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line/60 bg-ink text-paper">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">
              Luthiería de autor — Madrid
            </p>
            <p className="mt-6 max-w-sm font-display text-3xl leading-tight text-balance sm:text-4xl">
              Instrumentos con alma, construidos para quedarse.
            </p>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-paper/70">
              Dedicados a los músicos que buscan el alma en su sonido desde
              1994.
            </p>
          </div>

          <nav className="lg:col-span-2" aria-label="Colección">
            <h2 className="mb-5 text-sm font-medium uppercase tracking-[0.24em] text-accent">
              Colección
            </h2>
            <ul className="space-y-3 text-sm text-paper/70">
              {categorias.map((categoria) => (
                <li key={categoria}>{categoria}</li>
              ))}
              <li>
                <Link href="/catalogo" className={`${enlaceFooter} mt-2`}>
                  Ver catálogo completo →
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <h2 className="mb-5 text-sm font-medium uppercase tracking-[0.24em] text-accent">
              Servicios
            </h2>
            <ul className="space-y-3 text-sm text-paper/70">
              {servicios.map((servicio) => (
                <li key={servicio}>{servicio}</li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="mb-5 text-sm font-medium uppercase tracking-[0.24em] text-accent">
              Visítanos
            </h2>
            <address className="space-y-3 text-sm not-italic text-paper/70">
              <p>
                Calle Mayor 12
                <br />
                28013 Madrid, España
              </p>
              <p>
                <a href="mailto:info@voltioymadera.es" className={enlaceFooter}>
                  info@voltioymadera.es
                </a>
              </p>
              <p>
                <a href="tel:+34912345678" className={enlaceFooter}>
                  +34 912 345 678
                </a>
              </p>
            </address>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="mt-16 select-none overflow-hidden border-t border-paper/10 pt-8 font-display text-[clamp(2.5rem,10vw,9rem)] leading-[0.85] tracking-[-0.04em] whitespace-nowrap text-paper/10"
        >
          Voltio &amp; Madera
        </p>

        <div className="mt-6 flex flex-col gap-2 border-t border-paper/10 pt-6 text-sm text-paper/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Voltio &amp; Madera. Todos los derechos reservados.</p>
          <p>Hecho a mano en Madrid, España.</p>
        </div>
      </Container>
    </footer>
  );
}
