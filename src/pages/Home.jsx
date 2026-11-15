import { Link } from "react-router-dom";
import { guitarras } from "../data/guitarras";
import { formatPrice } from "../utils/formatPrice";
import { useReveal } from "../hooks/useReveal";
import Container from "../components/ui/Container";
import { buttonClasses } from "../components/ui/buttonStyles";
import GuitarCard from "../components/GuitarCard";

const hero = guitarras.find((guitarra) => guitarra.id === 2) ?? guitarras[0];
const marcas = [...new Set(guitarras.map((guitarra) => guitarra.marca))];
const destacadas = [guitarras[0], guitarras[5], guitarras[10]];

const cifras = [
  { valor: "1994", etiqueta: "Año de apertura del taller" },
  { valor: "12", etiqueta: "Piezas seleccionadas en catálogo" },
  { valor: "100 %", etiqueta: "Ajuste artesanal antes de la entrega" },
];

export default function Home() {
  const seleccionRef = useReveal();
  const cierreRef = useReveal();

  return (
    <>
      <section className="relative overflow-hidden">
        <Container className="grid min-h-[calc(100svh-5.5rem)] grid-cols-1 items-start gap-14 py-16 lg:grid-cols-12 lg:items-end lg:gap-10 lg:py-20">
          <div className="lg:col-span-7">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">
              Luthiería de autor — Madrid, desde 1994
            </p>
            <h1 className="mt-8 font-display text-display text-balance text-ink">
              El <em className="italic text-accent">alma</em>
              <br />
              del sonido.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">
              Instrumentos de boutique elegidos uno a uno, ajustados a mano y
              listos para acompañarte toda la vida. No vendemos guitarras:
              cuidamos el sonido de quien las toca.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/catalogo" className={buttonClasses("solid")}>
                Explorar el catálogo
              </Link>
              <Link to="/acerca" className={buttonClasses("outline")}>
                Conoce el taller
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <figure className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line/80 bg-paper-deep">
                <img
                  src={hero.imagen}
                  alt={`${hero.nombre} — ${hero.marca}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-5 left-5 rounded-full bg-paper/90 px-4 py-1.5 text-sm font-medium uppercase tracking-[0.18em] text-ink">
                  Pieza destacada
                </span>
              </div>
              <figcaption className="mt-5 flex items-start justify-between gap-6 border-t border-line/80 pt-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                    {hero.marca}
                  </p>
                  <p className="mt-1 font-display text-2xl leading-tight text-ink">
                    {hero.nombre}
                  </p>
                </div>
                <p className="shrink-0 font-display text-xl text-ink">
                  {formatPrice(hero.precio)}
                </p>
              </figcaption>
            </figure>
          </div>
        </Container>
      </section>

      <section aria-label="El taller en cifras" className="border-y border-line/70">
        <Container className="grid grid-cols-1 divide-y divide-line/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {cifras.map((cifra) => (
            <div key={cifra.etiqueta} className="px-0 py-8 sm:px-8 sm:py-10">
              <p className="font-sans text-3xl font-semibold tracking-tight text-ink">
                {cifra.valor}
              </p>
              <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-ink-soft">
                {cifra.etiqueta}
              </p>
            </div>
          ))}
        </Container>
      </section>

      <section aria-label="Marcas representadas" className="border-b border-line/70 bg-paper-deep/40 py-6">
        <div className="marquee-mask overflow-hidden">
          <div className="marquee-track flex w-max items-center">
            <div className="flex items-center gap-14 pr-14">
              {marcas.map((marca) => (
                <span
                  key={marca}
                  className="font-display text-2xl whitespace-nowrap text-ink/60"
                >
                  {marca}
                </span>
              ))}
            </div>
            <div
              aria-hidden="true"
              className="marquee-duplicate flex items-center gap-14 pr-14"
            >
              {marcas.map((marca) => (
                <span
                  key={`dup-${marca}`}
                  className="font-display text-2xl whitespace-nowrap text-ink/60"
                >
                  {marca}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div
            ref={seleccionRef}
            data-reveal=""
            className="flex flex-wrap items-end justify-between gap-6"
          >
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">
                01 — Selección
              </p>
              <h2 className="mt-4 max-w-2xl font-display text-h2 text-balance text-ink">
                Tres instrumentos que no deberías dejar pasar.
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="nav-link py-1 text-sm font-medium uppercase tracking-[0.16em] text-ink"
            >
              Ver las 12 piezas
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3">
            {destacadas.map((guitarra, index) => (
              <div
                key={guitarra.id}
                className="stagger-item"
                style={{ "--stagger": index }}
              >
                <GuitarCard guitarra={guitarra} index={guitarra.id - 1} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-line/70">
        <Container className="grid gap-10 py-20 sm:py-24 lg:grid-cols-12">
          <div
            ref={cierreRef}
            data-reveal=""
            className="lg:col-span-7"
          >
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">
              02 — Encargos
            </p>
            <h2 className="mt-4 font-display text-h2 text-balance text-ink">
              Cada instrumento tiene una historia. La tuya empieza con una
              conversación.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pl-10">
            <p className="text-base leading-relaxed text-ink-soft">
              Trabajamos encargos a medida, restauraciones y puestas a punto.
              Escríbenos y te contamos qué podemos hacer con tu instrumento, sin
              compromiso.
            </p>
            <Link
              to="/contacto"
              className={`${buttonClasses("outline")} mt-8`}
            >
              Hablemos
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
