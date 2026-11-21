import Link from "next/link";
import { hrefCatalogo, type FiltrosCatalogo } from "@/lib/catalogo-url";

const base =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm font-medium tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
const normal = `${base} border-line text-ink hover:border-ink`;
const actual = `${base} border-ink bg-ink text-paper`;

type Props = {
  filtros: FiltrosCatalogo;
  pagina: number;
  totalPaginas: number;
};

/**
 * Paginación del catálogo: enlaces normales que conservan los filtros, así
 * que funciona sin JavaScript y cada página tiene su propia URL.
 */
export default function Paginacion({ filtros, pagina, totalPaginas }: Props) {
  if (totalPaginas <= 1) return null;

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <nav aria-label="Paginación del catálogo" className="mt-20">
      <ul className="flex flex-wrap items-center justify-center gap-3">
        {pagina > 1 && (
          <li>
            <Link
              href={hrefCatalogo(filtros, { pagina: pagina - 1 })}
              rel="prev"
              className={normal}
            >
              ← Anterior
            </Link>
          </li>
        )}
        {paginas.map((numero) => (
          <li key={numero}>
            <Link
              href={hrefCatalogo(filtros, { pagina: numero })}
              aria-current={numero === pagina ? "page" : undefined}
              aria-label={`Página ${numero}`}
              className={numero === pagina ? actual : normal}
            >
              {numero}
            </Link>
          </li>
        ))}
        {pagina < totalPaginas && (
          <li>
            <Link
              href={hrefCatalogo(filtros, { pagina: pagina + 1 })}
              rel="next"
              className={normal}
            >
              Siguiente →
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
