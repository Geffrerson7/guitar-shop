import { useParams, Link } from "react-router-dom";
import { guitarras } from "../data/guitarras";
import { formatPrice } from "../utils/formatPrice";
import Container from "../components/ui/Container";
import { buttonClasses } from "../components/ui/buttonStyles";

const enlaceVolver =
  "inline-flex items-center gap-2 rounded-sm text-sm font-medium uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-accent";

export default function Producto() {
  const { id } = useParams();
  const guitarra = guitarras.find((g) => g.id === Number(id));

  if (!guitarra) {
    return (
      <Container className="py-24">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">
          02 — Detalle
        </p>
        <h1 className="mt-6 max-w-3xl font-display text-h1 text-balance text-ink">
          Esta pieza ya no está en el taller.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink-soft">
          Puede que se haya vendido o que el enlace no sea correcto. Te
          esperamos en el catálogo.
        </p>
        <Link
          to="/catalogo"
          className={`${buttonClasses("outline")} mt-10`}
        >
          ← Volver al catálogo
        </Link>
      </Container>
    );
  }

  const consulta = `mailto:info@voltioymadera.es?subject=${encodeURIComponent(
    `Consulta sobre ${guitarra.nombre}`,
  )}`;

  return (
    <article className="pb-8">
      <Container className="pt-8">
        <nav aria-label="Migas de pan" className="mb-10">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
            <li>
              <Link to="/catalogo" className="rounded-sm hover:text-accent">
                Catálogo
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {guitarra.nombre}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <figure>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line/80 bg-paper-deep">
                <img
                  src={guitarra.imagen}
                  alt={`${guitarra.nombre} — ${guitarra.marca}`}
                  className="h-full w-full object-cover"
                />
                {guitarra.badge && (
                  <span className="absolute top-6 left-6 rounded-full bg-paper/90 px-4 py-1.5 text-sm uppercase tracking-[0.16em] text-ink">
                    {guitarra.badge}
                  </span>
                )}
                <span className="absolute right-6 bottom-6 rounded-full bg-ink/85 px-4 py-1.5 text-sm tracking-[0.2em] text-paper">
                  {String(guitarra.id).padStart(2, "0")} / 12
                </span>
              </div>
              <figcaption className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-soft">
                <span>{guitarra.categoria}</span>
                <span>Ajustada a mano en el taller de Madrid</span>
              </figcaption>
            </figure>
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Link to="/catalogo" className={enlaceVolver}>
                ← Volver al catálogo
              </Link>

              <p className="mt-10 text-sm font-medium uppercase tracking-[0.3em] text-accent">
                {guitarra.marca}
              </p>
              <h1 className="mt-4 font-display text-h1 text-balance text-ink">
                {guitarra.nombre}
              </h1>

              <p className="mt-8 font-display text-5xl tracking-[-0.03em] text-ink sm:text-6xl">
                {formatPrice(guitarra.precio)}
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                IVA incluido · Envío asegurado en península
              </p>

              <p className="mt-8 text-lg leading-relaxed text-ink-soft">
                {guitarra.descripcion}
              </p>

              {guitarra.specs.length > 0 && (
                <div className="mt-10 border-t border-line/80">
                  <h2 className="py-4 text-sm font-medium uppercase tracking-[0.24em] text-ink">
                    Especificaciones
                  </h2>
                  <ul className="divide-y divide-line/70 border-t border-line/80">
                    {guitarra.specs.map((spec, index) => (
                      <li
                        key={spec}
                        className="flex items-baseline gap-5 py-4 text-base text-ink-soft"
                      >
                        <span className="text-sm text-accent">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-10 flex flex-col gap-4">
                <button
                  type="button"
                  disabled
                  title="La venta online llegará en una próxima fase"
                  className={buttonClasses("solid", "w-full")}
                >
                  Añadir al carrito — Próximamente
                </button>
                <a href={consulta} className={buttonClasses("outline", "w-full")}>
                  Consultar disponibilidad
                </a>
                <p className="text-sm leading-relaxed text-ink-soft">
                  Todavía no vendemos online. Escríbenos y preparamos la
                  reserva, la prueba en taller o el envío.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </article>
  );
}
