import { getGuitarras } from "@/lib/guitarras";
import { staggerStyle } from "@/utils/stagger";
import GuitarCard from "@/components/GuitarCard";
import Container from "@/components/ui/Container";
import PageTitle from "@/components/ui/PageTitle";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Catálogo",
  description:
    "Doce instrumentos de boutique elegidos por su carácter, su construcción y su sonido: eléctricas, acústicas, bajos y amplificación, ajustados a mano en Madrid.",
  path: "/catalogo",
});

const columnas = [
  "lg:col-span-7",
  "lg:col-span-5 lg:mt-16",
  "lg:col-span-5",
  "lg:col-span-7 lg:mt-16",
];

export default async function Catalogo() {
  const guitarras = await getGuitarras();

  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-line/80 pb-10">
          <PageTitle
            eyebrow="01 — Catálogo"
            title="Instrumentos de boutique"
            intro="Doce piezas elegidas por su carácter, su construcción y su sonido. Cada una pasa por el taller antes de salir."
          />
          <p className="text-sm uppercase tracking-[0.2em] text-ink-soft">
            {guitarras.length} piezas disponibles
          </p>
        </div>

        {guitarras.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="font-display text-h2 text-ink">
              El taller está en silencio.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-ink-soft">
              Ahora mismo no hay instrumentos publicados. Vuelve pronto o
              escríbenos para conocer las piezas que están en preparación.
            </p>
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-12">
            {guitarras.map((guitarra, index) => (
              <div
                key={guitarra.id}
                className={`stagger-item md:col-span-1 ${columnas[index % columnas.length]}`}
                style={staggerStyle(index)}
              >
                <GuitarCard
                  guitarra={guitarra}
                  index={index}
                  wide={index % 4 === 0 || index % 4 === 3}
                  lcp={index === 0}
                />
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
