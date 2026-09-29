import { Link } from "react-router-dom";
export default function GuitarCard({ guitarra }) {
  return (
    <Link to={`/producto/${guitarra.id}`}>
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className="relative aspect-4/5 overflow-hidden bg-stone-100">
          <img
            src={guitarra.imagen}
            alt={guitarra.nombre}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          />
          {guitarra.badge && (
            <span className="absolute top-3 left-3 bg-stone-800 text-amber-50 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest">
              {guitarra.badge}
            </span>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-lg font-bold text-stone-800 mb-1">
            {guitarra.nombre}
          </h3>
          <p className="text-base text-stone-600 mb-4">{guitarra.marca}</p>
          <span className="text-xl font-bold text-amber-700">
            {guitarra.precio.toLocaleString()} €
          </span>
        </div>
      </div>
    </Link>
  );
}
