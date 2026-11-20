import Link from "next/link";
import LinkSpinner from "@/components/LinkSpinner";
import { getGuitarras } from "@/lib/guitarras";
import Container from "@/components/ui/Container";
import PageTitle from "@/components/ui/PageTitle";
import Reveal from "@/components/Reveal";
import { buttonClasses } from "@/components/ui/buttonStyles";
import ProductImage, { imageSizes } from "@/components/ProductImage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "El taller",
  description:
    "Una luthería de barrio en el centro de Madrid desde 1994: compramos, restauramos y ajustamos instrumentos para músicos que quieren entender qué tienen entre las manos.",
  path: "/acerca",
});

const cifras = [
  { valor: "1994", etiqueta: "Año en que abrimos el taller" },
  { valor: "3", etiqueta: "Maestros luthieres en el equipo" },
  { valor: "12", etiqueta: "Piezas vivas en el catálogo" },
];

const principios = [
  {
    numero: "01",
    titulo: "Selección, no catálogo infinito",
    texto:
      "Preferimos doce instrumentos que podamos defender a doscientas referencias que no hayamos tocado. Cada pieza entra en la tienda después de pasar por nuestras manos.",
  },
  {
    numero: "02",
    titulo: "El ajuste forma parte del instrumento",
    texto:
      "Antes de entregar una guitarra revisamos acción, octavación, electrónica y acabado. No es un extra: es lo que separa un objeto de un instrumento.",
  },
  {
    numero: "03",
    titulo: "Una relación que dura décadas",
    texto:
      "Vendemos a músicos que vuelven. Por eso documentamos cada ajuste, guardamos el historial de la pieza y seguimos disponibles cuando algo se mueve.",
  },
];

export default async function Acerca() {
  const guitarras = await getGuitarras();
  const retrato = guitarras[6] ?? guitarras[0];

  return (
    <div className="py-16 sm:py-20">
      <Container>
        <PageTitle
          eyebrow="02 — Taller"
          title="Treinta años buscando el alma del sonido."
          intro="Somos una luthería de barrio en el centro de Madrid. Desde 1994 compramos, restauramos y ajustamos instrumentos para músicos que quieren entender qué tienen entre las manos."
        />

        {retrato && (
          <figure className="mt-14">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-line/80 bg-paper-deep">
              <ProductImage
                src={retrato.imagen}
                alt={`${retrato.nombre} — ${retrato.marca}`}
                sizes={imageSizes.container}
              />
            </div>
            <figcaption className="mt-4 text-sm text-ink-soft">
              {retrato.nombre}, una de las piezas que han pasado por el taller
              este año.
            </figcaption>
          </figure>
        )}

        <Reveal className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 className="font-display text-h2 text-balance text-ink">
              La obsesión por el detalle, contada sin prisa.
            </h2>
            <div className="mt-8 space-y-6 text-base leading-relaxed text-ink-soft">
              <p>
                Empezamos reparando guitarras de amigos en un local de 20 m².
                Treinta años después seguimos haciendo lo mismo, con más
                herramientas y menos prisa: escuchar al músico, entender el
                instrumento y decidir qué merece la pena conservar.
              </p>
              <p>
                No trabajamos con catálogos de temporada. Cuando una pieza llega
                al taller, la estudiamos, la documentamos y decidimos si tiene
                algo que contar. Si no lo tiene, no entra.
              </p>
              <p>
                Lo que ves en el catálogo es lo que hay. Si buscas algo que no
                está, escríbenos: la mitad de nuestro trabajo consiste en
                encontrar la guitarra que todavía no sabes que estás buscando.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-[1.75rem] border border-line/80 bg-paper-deep/60 p-8 sm:p-10">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">
                El taller en cifras
              </p>
              <dl className="mt-8 space-y-8">
                {cifras.map((cifra) => (
                  <div key={cifra.etiqueta}>
                    <dd className="font-sans text-3xl font-semibold tracking-tight text-ink">
                      {cifra.valor}
                    </dd>
                    <dt className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {cifra.etiqueta}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-20">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">
            Cómo trabajamos
          </p>
          <div className="mt-8 grid grid-cols-1 gap-10 border-t border-line/80 pt-10 md:grid-cols-3">
            {principios.map((principio) => (
              <article key={principio.numero}>
                <p className="font-display text-2xl text-accent">
                  {principio.numero}
                </p>
                <h2 className="mt-3 font-display text-2xl leading-tight text-ink">
                  {principio.titulo}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-soft">
                  {principio.texto}
                </p>
              </article>
            ))}
          </div>
        </Reveal>

        <div className="mt-20 flex flex-wrap items-center gap-4 border-t border-line/80 pt-10">
          <Link href="/catalogo" className={buttonClasses("solid")}>
            <LinkSpinner>Ver el catálogo</LinkSpinner>
          </Link>
          <Link href="/contacto" className={buttonClasses("outline")}>
            Escríbenos
          </Link>
        </div>
      </Container>
    </div>
  );
}
