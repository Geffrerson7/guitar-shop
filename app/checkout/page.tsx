import type { Metadata } from "next";
import FormularioCheckout from "@/components/checkout/FormularioCheckout";
import Container from "@/components/ui/Container";
import PageTitle from "@/components/ui/PageTitle";

/*
 * Checkout (Fase 11). Página estática: el carrito vive en el navegador y el
 * formulario lo resuelve en cliente; el pedido lo crea la Server Action de
 * ./actions.ts. No se indexa (`noindex` aquí y `Disallow` en robots.txt).
 */
export const metadata: Metadata = {
  title: "Finalizar compra",
  description: "Datos de contacto y envío para tu pedido en Voltio & Madera.",
  robots: { index: false, follow: false },
};

export default function Checkout() {
  return (
    <div className="py-16 sm:py-20">
      <Container>
        <PageTitle
          eyebrow="Último paso"
          title="Finalizar compra"
          intro="Solo te pedimos lo necesario para enviarte el pedido. El pago es simulado: no se realiza ningún cargo."
        />
        <FormularioCheckout />
      </Container>
    </div>
  );
}
