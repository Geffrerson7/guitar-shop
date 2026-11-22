import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Container from "@/components/ui/Container";
import PageTitle from "@/components/ui/PageTitle";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { getPedidoPorCodigo } from "@/lib/pedidos";
import { enmascararEmail } from "@/lib/pedidos-calculo";
import { formatPrice } from "@/utils/formatPrice";

/*
 * Confirmación de pedido (Fase 11). El código es aleatorio (80 bits) y es lo
 * único que da acceso: quien no lo tiene no puede llegar aquí. Aun así se
 * enseña lo mínimo: el nombre, el email enmascarado y la localidad, nunca la
 * dirección ni el teléfono.
 *
 * Siempre dinámica (el estado del pedido cambiará desde el panel, Fase 13),
 * sin indexar y sin `Referer`, para que el código no viaje a otros sitios.
 */

export const metadata: Metadata = {
  title: "Pedido confirmado",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const textoEstado = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  enviado: "Enviado",
  cancelado: "Cancelado",
} as const;

const fecha = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Madrid",
});

export default async function Pedido({
  params,
}: PageProps<"/pedido/[codigo]">) {
  await connection();
  const { codigo } = await params;
  const pedido = await getPedidoPorCodigo(decodeURIComponent(codigo));
  if (!pedido) notFound();

  const unidades = pedido.lineas.reduce((n, l) => n + l.cantidad, 0);

  return (
    <div className="py-16 sm:py-20">
      <Container>
        <PageTitle
          eyebrow="Pedido registrado"
          title={`Gracias, ${pedido.nombre.split(" ")[0]}.`}
          intro={`Hemos registrado tu pedido. Te escribiremos a ${enmascararEmail(pedido.email)} cuando salga del taller.`}
        />

        <p className="mt-8 max-w-2xl rounded-2xl border border-line bg-paper-deep/40 px-5 py-4 text-base text-ink">
          <strong className="font-medium">
            Pago simulado — no se ha realizado ningún cargo.
          </strong>{" "}
          Es una tienda de demostración: el pedido queda registrado, pero nadie
          te cobrará nada.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          <section aria-labelledby="pedido-lineas" className="lg:col-span-8">
            <h2
              id="pedido-lineas"
              className="border-b border-line/80 pb-4 text-sm font-medium uppercase tracking-[0.24em] text-ink"
            >
              {unidades === 1 ? "1 artículo" : `${unidades} artículos`}
            </h2>
            <ul>
              {pedido.lineas.map((linea) => (
                <li
                  key={linea.productoId}
                  className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line/80 py-5"
                >
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                      {linea.marca}
                    </p>
                    <p className="mt-1 font-display text-2xl text-ink">
                      {linea.nombre}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {linea.cantidad} ×{" "}
                      {formatPrice(linea.precioUnitarioCentimos)}
                    </p>
                  </div>
                  <p className="font-display text-xl text-ink tabular-nums">
                    {formatPrice(linea.precioUnitarioCentimos * linea.cantidad)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <aside aria-labelledby="pedido-resumen" className="lg:col-span-4">
            <div className="rounded-[2rem] border border-line/80 bg-paper-deep/40 p-6 sm:p-8">
              <h2
                id="pedido-resumen"
                className="text-sm font-medium uppercase tracking-[0.24em] text-ink"
              >
                Resumen
              </h2>
              <dl className="mt-6 divide-y divide-line/70 text-base">
                <div className="flex flex-col gap-1 pb-4">
                  <dt className="text-sm text-ink-soft">Código de pedido</dt>
                  <dd
                    data-testid="codigo-pedido"
                    className="font-medium tracking-[0.08em] break-all text-ink"
                  >
                    {pedido.codigo}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-ink-soft">Estado</dt>
                  <dd className="text-ink">{textoEstado[pedido.estado]}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-ink-soft">Fecha</dt>
                  <dd className="text-right text-ink">
                    {fecha.format(pedido.creadoEn)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-ink-soft">Envío a</dt>
                  <dd className="text-right text-ink">
                    {pedido.localidad} ({pedido.provincia})
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 pt-4">
                  <dt className="font-medium text-ink">Total</dt>
                  <dd
                    data-testid="total-pedido"
                    className="font-display text-3xl text-ink tabular-nums"
                  >
                    {formatPrice(pedido.totalCentimos)}
                  </dd>
                </div>
              </dl>
              <p className="mt-2 text-sm text-ink-soft">
                IVA y envío incluidos.
              </p>
              <p className="mt-6 text-sm leading-relaxed text-ink-soft">
                Guarda el código: es lo único que da acceso a esta página. Si
                tienes cualquier duda, escríbenos a info@voltioymadera.es
                indicándolo.
              </p>
              <Link
                href="/catalogo"
                className={buttonClasses("outline", "mt-8 w-full")}
              >
                Seguir explorando
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
