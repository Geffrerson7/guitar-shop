import { Link } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";

function formatIndex(index) {
  return String(index + 1).padStart(2, "0");
}

export default function GuitarCard({ guitarra, index = 0, wide = false }) {
  return (
    <Link
      to={`/producto/${guitarra.id}`}
      className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <article>
        <div
          className={`relative overflow-hidden rounded-2xl border border-line/70 bg-paper-deep ${
            wide ? "aspect-[16/11]" : "aspect-[4/5]"
          }`}
        >
          <img
            src={guitarra.imagen}
            alt={`${guitarra.nombre} — ${guitarra.marca}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          />

          <span className="absolute top-4 left-4 rounded-full bg-paper/90 px-3 py-1 text-sm font-medium tracking-[0.16em] text-ink">
            {formatIndex(index)}
          </span>

          {guitarra.badge && (
            <span className="absolute top-4 right-4 rounded-full bg-ink/90 px-3 py-1 text-sm uppercase tracking-[0.16em] text-paper">
              {guitarra.badge}
            </span>
          )}

          <span className="absolute right-4 bottom-4 translate-y-2 rounded-full bg-paper px-4 py-2 text-sm font-medium uppercase tracking-[0.14em] text-ink opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
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
              {guitarra.nombre}
            </h2>
          </div>
          <p className="shrink-0 font-display text-xl text-ink transition-transform duration-300 group-hover:-translate-y-0.5">
            {formatPrice(guitarra.precio)}
          </p>
        </div>
      </article>
    </Link>
  );
}
