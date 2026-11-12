import { Link } from "react-router-dom";

const enlaceFooter =
  "rounded transition-colors hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200";

const categorias = [
  "Guitarras Eléctricas",
  "Guitarras Acústicas",
  "Bajos",
  "Amplificadores",
];

const servicios = [
  "Taller de Luthier",
  "Tasaciones Vintage",
  "Custom Shop",
  "Clínicas",
];

export default function Footer() {
  return (
    <footer className="w-full bg-stone-800 text-stone-300 py-12 mt-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <p className="text-amber-200 text-lg font-serif font-bold mb-4">
            Luthier &amp; Co.
          </p>
          <p className="text-sm text-stone-400">
            Dedicados a los músicos que buscan el alma en su sonido. Desde 1994.
          </p>
        </div>
        <div>
          <h2 className="text-amber-200 text-xs font-bold mb-4 tracking-widest uppercase">
            Tienda
          </h2>
          <ul className="space-y-2 text-sm">
            {categorias.map((categoria) => (
              <li key={categoria}>
                <Link to="/catalogo" className={enlaceFooter}>
                  {categoria}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-amber-200 text-xs font-bold mb-4 tracking-widest uppercase">
            Servicios
          </h2>
          <ul className="space-y-2 text-sm">
            {servicios.map((servicio) => (
              <li key={servicio}>{servicio}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-amber-200 text-xs font-bold mb-4 tracking-widest uppercase">
            Contacto
          </h2>
          <ul className="space-y-2 text-sm">
            <li>Calle Mayor 12, Madrid</li>
            <li>
              <a href="mailto:info@luthierandco.es" className={enlaceFooter}>
                info@luthierandco.es
              </a>
            </li>
            <li>
              <a href="tel:+34912345678" className={enlaceFooter}>
                +34 912 345 678
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
