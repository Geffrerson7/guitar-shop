import type { Metadata } from "next";
import CarritoVista from "@/components/carrito/CarritoVista";
import Container from "@/components/ui/Container";
import PageTitle from "@/components/ui/PageTitle";

/*
 * Carrito (Fase 10). La página es estática: el contenido vive en el navegador
 * y lo resuelve `CarritoVista` contra `GET /api/carrito`. No se indexa
 * (`noindex` aquí y `Disallow` en robots.txt).
 */
export const metadata: Metadata = {
  title: "Carrito",
  description: "Las piezas que has elegido en Voltio & Madera.",
  robots: { index: false, follow: true },
};

export default function Carrito() {
  return (
    <div className="py-16 sm:py-20">
      <Container>
        <PageTitle eyebrow="Tu selección" title="Carrito" />
        <CarritoVista />
      </Container>
    </div>
  );
}
