import Container from "@/components/ui/Container";
import PageTitle from "@/components/ui/PageTitle";
import Reveal from "@/components/Reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contacto",
  description:
    "Encargos a medida, restauraciones, tasaciones o una puesta a punto. Escríbenos o visítanos en Calle Mayor 12, Madrid: respondemos en 24–48 horas laborables.",
  path: "/contacto",
});

const horario = [
  { dias: "Lunes — Viernes", horas: "10:00 — 19:30" },
  { dias: "Sábado", horas: "10:00 — 14:00" },
  { dias: "Domingo y festivos", horas: "Cerrado" },
];

const filaContacto =
  "group flex flex-col gap-1 border-b border-line/80 py-6 transition-colors hover:text-accent sm:flex-row sm:items-baseline sm:justify-between sm:gap-8";

export default function Contacto() {
  return (
    <div className="py-16 sm:py-20">
      <Container>
        <PageTitle
          eyebrow="03 — Contacto"
          title="Hablemos de tu próximo instrumento."
          intro="Encargos a medida, restauraciones, tasaciones o una simple puesta a punto. Cuéntanos qué necesitas y te respondemos en 24–48 horas laborables."
        />

        <div className="mt-16 grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <ul className="border-t border-line/80">
              <li>
                <a href="mailto:info@voltioymadera.es" className={filaContacto}>
                  <span className="text-sm font-medium uppercase tracking-[0.24em] text-ink-soft">
                    Correo
                  </span>
                  <span className="font-display text-2xl break-all text-ink group-hover:text-accent sm:text-3xl">
                    info@voltioymadera.es
                  </span>
                </a>
              </li>
              <li>
                <a href="tel:+34912345678" className={filaContacto}>
                  <span className="text-sm font-medium uppercase tracking-[0.24em] text-ink-soft">
                    Teléfono
                  </span>
                  <span className="font-sans text-xl font-medium tracking-[0.04em] text-ink group-hover:text-accent sm:text-2xl">
                    +34 912 345 678
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://maps.google.com/?q=Calle+Mayor+12,+28013+Madrid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={filaContacto}
                >
                  <span className="text-sm font-medium uppercase tracking-[0.24em] text-ink-soft">
                    Taller
                  </span>
                  <span className="font-display text-2xl text-ink group-hover:text-accent sm:text-3xl">
                    Calle Mayor 12, Madrid ↗
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/voltioymadera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={filaContacto}
                >
                  <span className="text-sm font-medium uppercase tracking-[0.24em] text-ink-soft">
                    Instagram
                  </span>
                  <span className="font-display text-2xl text-ink group-hover:text-accent sm:text-3xl">
                    @voltioymadera ↗
                  </span>
                </a>
              </li>
            </ul>

            <p className="mt-8 max-w-xl text-base leading-relaxed text-ink-soft">
              Si vienes a probar un instrumento, avísanos antes: preparamos la
              pieza, la ajustamos a tu gusto y te reservamos la sala de prueba.
            </p>
          </Reveal>

          <aside className="lg:col-span-5">
            <div className="rounded-[1.75rem] border border-line/80 bg-paper-deep/60 p-8 sm:p-10">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">
                Horario del taller
              </p>
              <dl className="mt-6 divide-y divide-line/70 border-t border-line/70">
                {horario.map((item) => (
                  <div
                    key={item.dias}
                    className="flex items-baseline justify-between gap-6 py-4"
                  >
                    <dt className="text-sm text-ink-soft">{item.dias}</dt>
                    <dd className="text-right text-sm font-medium text-ink">
                      {item.horas}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-sm leading-relaxed text-ink-soft">
                Cerrado los días festivos. Para encargos urgentes, el correo es
                el canal más rápido.
              </p>
            </div>

            <div className="mt-8 border-t border-line/80 pt-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-ink">
                Cómo llegar
              </p>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                Metro Ópera (líneas 2 y 5) y Sol (1, 2 y 3). A cinco minutos a
                pie de la Plaza Mayor.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
