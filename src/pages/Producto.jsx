import { useParams, Link } from "react-router-dom";
import { guitarras } from "../data/guitarras";

export default function Producto() {
  const { id } = useParams();
  const guitarra = guitarras.find((g) => g.id === Number(id));

  if (!guitarra) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-stone-800">
          Producto no encontrado
        </h1>
        <Link
          to="/catalogo"
          className="text-amber-700 underline mt-4 inline-block rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700"
        >
          ← Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <Link
        to="/catalogo"
        className="text-amber-700 underline mt-4 inline-block rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700"
      >
        ← Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-stone-100 rounded-xl overflow-hidden shadow-md">
          <img
            src={guitarra.imagen}
            alt={`${guitarra.nombre} de ${guitarra.marca}`}
            className="w-full aspect-4/5 object-cover"
          />
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-sm text-amber-700 tracking-widest uppercase font-bold">
            {guitarra.marca}
          </p>
          <h1 className="text-3xl font-bold font-serif text-stone-800">
            {guitarra.nombre}
          </h1>
          <p className="text-2xl font-bold text-amber-700">{guitarra.precio} €</p>
          <p className="text-stone-600 leading-relaxed">
            {guitarra.descripcion}
          </p>
          <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
            <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-3">
              Especificaciones
            </h2>
            <ul className="flex flex-col gap-2">
              {guitarra?.specs.map((spec) => (
                <li key={spec} className="flex items-center gap-2 text-sm text-stone-700">
                  <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                  {spec}
                </li>
              ))}
            </ul>
          </div>
          <button className="bg-amber-700 text-amber-50 font-bold py-3 px-6 rounded-lg hover:bg-amber-800 transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-800">
            AÑADIR AL CARRITO
          </button>
        </div>
      </div>
    </div>
  );
}
