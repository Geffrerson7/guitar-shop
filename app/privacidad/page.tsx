import Container from "@/components/ui/Container";
import PageTitle from "@/components/ui/PageTitle";
import { pageMetadata } from "@/lib/seo";

/*
 * Aviso de privacidad (Fase 11). Lo enlaza el consentimiento del checkout.
 * Describe exactamente lo que hace el código: qué se recoge (lib/validaciones/
 * checkout.ts), dónde se guarda y a quién no se envía.
 */
export const metadata = pageMetadata({
  title: "Privacidad",
  description:
    "Qué datos pide Voltio & Madera al hacer un pedido, para qué los usa, dónde se guardan y cómo ejercer tus derechos.",
  path: "/privacidad",
});

const apartado = "mt-14 border-t border-line/80 pt-8";
const titulo = "font-display text-2xl text-ink sm:text-3xl";
const parrafo = "mt-4 text-base leading-relaxed text-ink-soft";
const lista =
  "mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink-soft";

export default function Privacidad() {
  return (
    <div className="py-16 sm:py-20">
      <Container>
        <PageTitle
          eyebrow="Aviso de privacidad"
          title="Tus datos, solo para tu pedido."
          intro="Pedimos lo imprescindible para enviarte lo que compras y nada más. Este aviso explica qué datos son, para qué los usamos y dónde se guardan."
        />

        <div className="max-w-3xl">
          <section aria-labelledby="privacidad-demo" className={apartado}>
            <h2 id="privacidad-demo" className={titulo}>
              Una tienda de demostración
            </h2>
            <p className={parrafo}>
              Voltio &amp; Madera es un proyecto de portafolio. El pago es
              simulado: no se realiza ningún cargo y no se pide ningún dato de
              pago, ni real ni ficticio.
            </p>
          </section>

          <section aria-labelledby="privacidad-datos" className={apartado}>
            <h2 id="privacidad-datos" className={titulo}>
              Qué datos recogemos
            </h2>
            <p className={parrafo}>Solo al hacer un pedido, y solo estos:</p>
            <ul className={lista}>
              <li>Nombre y apellidos.</li>
              <li>Email.</li>
              <li>Teléfono, si decides darlo.</li>
              <li>
                Dirección de envío: calle, código postal, localidad y provincia.
              </li>
            </ul>
            <p className={parrafo}>
              Guardamos también las piezas del pedido, su precio en ese momento
              y la fecha en que aceptaste este aviso. No pedimos documentos de
              identidad, no creamos cuentas de cliente y no usamos cookies de
              seguimiento ni herramientas de analítica. El carrito se guarda
              solo en tu navegador.
            </p>
          </section>

          <section aria-labelledby="privacidad-uso" className={apartado}>
            <h2 id="privacidad-uso" className={titulo}>
              Para qué los usamos
            </h2>
            <p className={parrafo}>
              Para tramitar y enviar tu pedido y para escribirte sobre él. No
              los usamos para publicidad, no los vendemos y no los cedemos. La
              base para tratarlos es tu consentimiento, que das al confirmar el
              pedido y puedes retirar cuando quieras.
            </p>
          </section>

          <section aria-labelledby="privacidad-donde" className={apartado}>
            <h2 id="privacidad-donde" className={titulo}>
              Dónde se guardan
            </h2>
            <p className={parrafo}>
              Los datos no salen de la infraestructura del proyecto ni se envían
              a servicios de terceros. Esa infraestructura la prestan dos
              proveedores:
            </p>
            <ul className={lista}>
              <li>
                <strong className="font-medium text-ink">Vercel</strong>, que
                aloja la web y procesa el formulario al enviarlo.
              </li>
              <li>
                <strong className="font-medium text-ink">Neon</strong>, que
                aloja la base de datos PostgreSQL donde se guarda el pedido, en
                su región de la Unión Europea (AWS Europe, Fráncfort).
              </li>
            </ul>
          </section>

          <section aria-labelledby="privacidad-derechos" className={apartado}>
            <h2 id="privacidad-derechos" className={titulo}>
              Tus derechos
            </h2>
            <p className={parrafo}>
              Puedes pedir una copia de tus datos, corregirlos o que los
              borremos escribiendo a{" "}
              <a
                href="mailto:info@voltioymadera.es"
                className="rounded-sm font-medium text-ink underline underline-offset-4 transition-colors hover:text-accent"
              >
                info@voltioymadera.es
              </a>{" "}
              con tu código de pedido. También puedes reclamar ante la Agencia
              Española de Protección de Datos.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
