import Link from "next/link";
import type { Guitarra } from "@/types/guitarra";
import { formatPrice } from "@/utils/formatPrice";
import ProductImage, { imageSizes } from "./ProductImage";

function formatIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

type GuitarCardProps = {
  guitarra: Guitarra;
  index?: number;
  wide?: boolean;
  /** `sizes` de la imagen; por defecto, 7 o 5 columnas del catálogo según `wide`. */
  sizes?: string;
  /** Marca la imagen como LCP de la ruta (solo la primera tarjeta visible). */
  lcp?: boolean;
};

export default function GuitarCard({
  guitarra,
  index = 0,
  wide = false,
  sizes,
  lcp = false,
}: GuitarCardProps) {
  // Patrón de tarjeta accesible: el enlace es el nombre del producto (así su
  // nombre accesible es el del producto) y un pseudo-elemento lo estira sobre
  // toda la tarjeta para que siga siendo clicable entera. Antes el enlace
  // envolvía un <article> y se quedaba sin nombre accesible.
  return (
    <article className="group relative">
      <div
        className={`relative overflow-hidden rounded-2xl border border-line/70 bg-paper-deep ${
          wide ? "aspect-[16/11]" : "aspect-[4/5]"
        }`}
      >
        <ProductImage
          src={guitarra.imagen}
          alt={`${guitarra.nombre} — ${guitarra.marca}`}
          sizes={sizes ?? (wide ? imageSizes.cardWide : imageSizes.cardNarrow)}
          lcp={lcp}
          className="transition-transform duration-700 ease-out group-focus-within:scale-[1.045] group-hover:scale-[1.045]"
        />

        <span
          aria-hidden="true"
          className="absolute top-4 left-4 rounded-full bg-paper/90 px-3 py-1 text-sm font-medium tracking-[0.16em] text-ink"
        >
          {formatIndex(index)}
        </span>

        {guitarra.badge && (
          <span className="absolute top-4 right-4 rounded-full bg-ink/90 px-3 py-1 text-sm uppercase tracking-[0.16em] text-paper">
            {guitarra.badge}
          </span>
        )}

        <span
          aria-hidden="true"
          className="absolute right-4 bottom-4 translate-y-2 rounded-full bg-paper px-4 py-2 text-sm font-medium uppercase tracking-[0.14em] text-ink opacity-0 transition-[opacity,transform] duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Ver pieza →
        </span>
      </div>

      <div className="flex items-start justify-between gap-6 border-b border-line/80 py-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent transition-transform duration-300 group-hover:-translate-y-0.5">
            {guitarra.marca}
          </p>
          <h2
            className={`mt-1 font-display leading-tight text-ink ${
              wide ? "text-3xl" : "text-2xl"
            }`}
          >
            <Link
              href={`/producto/${guitarra.id}`}
              className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent"
            >
              {guitarra.nombre}
            </Link>
          </h2>
        </div>
        <p className="shrink-0 font-display text-xl text-ink transition-transform duration-300 group-hover:-translate-y-0.5">
          {formatPrice(guitarra.precioCentimos)}
        </p>
      </div>
    </article>
  );
}
