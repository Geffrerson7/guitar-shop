import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuitarraById, getGuitarras } from "@/lib/guitarras";
import { formatPrice } from "@/utils/formatPrice";
import Container from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/buttonStyles";

const enlaceVolver =
  "inline-flex items-center gap-2 rounded-sm text-sm font-medium uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-accent";

/** Ids que no son enteros positivos no llegan a la capa de datos. */
function parseId(raw: string): number | null {
  return /^[1-9]\d*$/.test(raw) ? Number(raw) : null;
}

export async function generateStaticParams() {
  const guitarras = await getGuitarras();
  return guitarras.map((guitarra) => ({ id: String(guitarra.id) }));
}

// Título básico por producto; la Metadata API completa llega en la Fase 5.
export async function generateMetadata({
  params,
}: PageProps<"/producto/[id]">): Promise<Metadata> {
  const { id } = await params;
  const numericId = parseId(id);
  const guitarra = numericId === null ? null : await getGuitarraById(numericId);
  return guitarra
    ? { title: `${guitarra.nombre} — Voltio & Madera` }
    : {};
}

export default async function Producto({
  params,
}: PageProps<"/producto/[id]">) {
  const { id } = await params;
  const numericId = parseId(id);
  const guitarra = numericId === null ? null : await getGuitarraById(numericId);

  if (!guitarra) notFound();

  const consulta = `mailto:info@voltioymadera.es?subject=${encodeURIComponent(
    `Consulta sobre ${guitarra.nombre}`,
  )}`;

  return (
    <article className="pb-8">
      <Container className="pt-8">
        <nav aria-label="Migas de pan" className="mb-10">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
            <li>
              <Link href="/catalogo" className="rounded-sm hover:text-accent">
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
              <Link href="/catalogo" className={enlaceVolver}>
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
