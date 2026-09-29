import { guitarras } from "../data/guitarras";
import GuitarCard from "../components/GuitarCard";
export default function Catalogo() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold font-serif text-stone-800">
        Instrumentos de Boutique
      </h1>
      <p className="text-lg text-stone-600 mt-2">
        Explora nuestra colección...
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {guitarras.map((guitarra) => (
          <GuitarCard key={guitarra.id} guitarra={guitarra} />
        ))}
      </div>
    </div>
  );
}
