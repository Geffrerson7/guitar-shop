import { Link } from "react-router-dom";

const enlaceNav =
  "rounded text-stone-800 hover:text-amber-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700";

export default function Header() {
  return (
    <header className="flex items-center justify-between py-5 px-10">
      <Link
        to="/"
        className="rounded font-bold text-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700"
      >
        Luthier &amp; Co.
      </Link>
      <nav aria-label="Navegación principal" className="flex gap-4">
        <Link to="/" className={enlaceNav}>
          Inicio
        </Link>
        <Link to="/contacto" className={enlaceNav}>
          Contacto
        </Link>
        <Link to="/acerca" className={enlaceNav}>
          Acerca
        </Link>
      </nav>
    </header>
  );
}
