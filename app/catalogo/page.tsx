import type { Metadata } from "next";
import Link from "next/link";
import {
  buscarGuitarras,
  getCategorias,
  getGuitarras,
  getMarcas,
} from "@/lib/guitarras";
import { hayFiltrosActivos, TAMANO_PAGINA } from "@/lib/catalogo-url";
import { parseFiltrosCatalogo } from "@/lib/validaciones/catalogo";
import { staggerStyle } from "@/utils/stagger";
import GuitarCard from "@/components/GuitarCard";
import FiltrosCatalogo from "@/components/catalogo/FiltrosCatalogo";
import NavegacionCatalogo, {
  ResultadosCatalogo,
} from "@/components/catalogo/NavegacionCatalogo";
import Paginacion from "@/components/catalogo/Paginacion";
import Container from "@/components/ui/Container";
import PageTitle from "@/components/ui/PageTitle";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { pageMetadata } from "@/lib/seo";

/*
 * Catálogo con búsqueda, filtros, orden y paginación (Fase 9). El estado vive
 * en la URL y se resuelve en el servidor, así que la página es dinámica (lee
 * `searchParams`); los datos de cada combinación salen de la caché de la capa
 * de datos.
 *
 * Sin `loading.tsx` a propósito: un límite de Suspense metería el esqueleto
 * en el HTML y, sin JavaScript, el catálogo saldría vacío. Mientras se navega
 * entre filtros, los resultados se atenúan (`ResultadosCatalogo`) y los
 * enlaces al catálogo muestran su spinner (`LinkSpinner`).
 *
 * El canonical es siempre `/catalogo`, sin parámetros: las combinaciones de
 * filtros no se indexan por separado.
 */
export async function generateMetadata(): Promise<Metadata> {
  const guitarras = await getGuitarras();

  return pageMetadata({
    title: "Catálogo",
    description: `${guitarras.length} instrumentos de boutique elegidos por su carácter, su construcción y su sonido: eléctricas, acústicas, bajos y amplificación, ajustados a mano en Madrid.`,
    path: "/catalogo",
  });
}

const columnas = [
  "lg:col-span-7",
  "lg:col-span-5 lg:mt-16",
  "lg:col-span-5",
  "lg:col-span-7 lg:mt-16",
];

function textoResultados(total: number, filtrado: boolean): string {
  if (!filtrado) {
    return `${total} ${total === 1 ? "pieza disponible" : "piezas disponibles"}`;
  }
  if (total === 0) return "Ninguna pieza coincide";
  return `${total} ${total === 1 ? "pieza coincide" : "piezas coinciden"}`;
}

export default async function Catalogo({
  searchParams,
}: PageProps<"/catalogo">) {
  const filtros = parseFiltrosCatalogo(await searchParams);
  const [resultado, categorias, marcas] = await Promise.all([
    buscarGuitarras(filtros),
    getCategorias(),
    getMarcas(),
  ]);
  const { guitarras, total, pagina, totalPaginas } = resultado;
  const filtrado = hayFiltrosActivos(filtros);
  const desplazamiento = (pagina - 1) * TAMANO_PAGINA;

  return (
    <div className="py-16 sm:py-20">
      <Container>
        <PageTitle
          eyebrow="01 — Catálogo"
          title="Instrumentos de boutique"
          intro="Doce piezas elegidas por su carácter, su construcción y su sonido. Cada una pasa por el taller antes de salir."
        />

        <NavegacionCatalogo>
          <FiltrosCatalogo
            filtros={filtros}
            categorias={categorias}
            marcas={marcas}
          />

          <ResultadosCatalogo>
            {/* Región viva: se anuncia al cambiar los filtros sin recargar. */}
            <p
              aria-live="polite"
              aria-atomic="true"
              className="mt-10 text-sm uppercase tracking-[0.2em] text-ink-soft"
            >
              {textoResultados(total, filtrado)}
              {totalPaginas > 1 && ` · página ${pagina} de ${totalPaginas}`}
            </p>

            {guitarras.length === 0 ? (
              filtrado ? (
                <div className="py-24 text-center">
                  <h2 className="font-display text-h2 text-ink">
                    Nada por aquí con esos criterios.
                  </h2>
                  <p className="mx-auto mt-4 max-w-md text-base text-ink-soft">
                    Prueba con otra búsqueda o amplía el rango de precio.
                    También puedes escribirnos: buscamos piezas por encargo.
                  </p>
                  <Link
                    href="/catalogo"
                    className={`${buttonClasses("outline")} mt-10`}
                  >
                    Limpiar filtros
                  </Link>
                </div>
              ) : (
                <div className="py-24 text-center">
                  <h2 className="font-display text-h2 text-ink">
                    El taller está en silencio.
                  </h2>
                  <p className="mx-auto mt-4 max-w-md text-base text-ink-soft">
                    Ahora mismo no hay instrumentos publicados. Vuelve pronto o
                    escríbenos para conocer las piezas que están en preparación.
                  </p>
                </div>
              )
            ) : (
              <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-12">
                {guitarras.map((guitarra, index) => (
                  <div
                    key={guitarra.id}
                    className={`stagger-item md:col-span-1 ${columnas[index % columnas.length]}`}
                    style={staggerStyle(index)}
                  >
                    <GuitarCard
                      guitarra={guitarra}
                      index={desplazamiento + index}
                      wide={index % 4 === 0 || index % 4 === 3}
                      lcp={index === 0}
                    />
                  </div>
                ))}
              </div>
            )}

            <Paginacion
              filtros={filtros}
              pagina={pagina}
              totalPaginas={totalPaginas}
            />
          </ResultadosCatalogo>
        </NavegacionCatalogo>
      </Container>
    </div>
  );
}
