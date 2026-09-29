import { Link } from "react-router-dom";
import { IoCartOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa6";

export default function Header() {
  return (
    <header className="flex justify-between py-5 px-10">
      <div>
        <span className="font-bold text-xl">Luthier &amp; Co.</span>
      </div>
      <nav className="flex gap-4">
        <Link to="/" className="text-stone-800 hover:text-amber-700 transition-colors">Inicio</Link>
        <Link to="/contacto" className="text-stone-800 hover:text-amber-700 transition-colors">Contacto</Link>
        <Link to="/acerca" className="text-stone-800 hover:text-amber-700 transition-colors">Acerca</Link>
      </nav>
      <div className="flex items-center gap-2">
        <IoCartOutline className="text-2xl" />
        <FaRegUser className="text-2xl" />
      </div>
    </header>
  );
}
