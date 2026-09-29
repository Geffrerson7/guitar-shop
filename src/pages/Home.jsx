import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <h1 className="text-5xl font-bold font-serif text-stone-800 mb-4">
        Luthier &amp; Co.
      </h1>
      <p className="text-xl text-stone-600 max-w-lg mb-8">
        La excelencia de un instrumento hecho a mano.
      </p>
      <Link to="/catalogo" className="border py-2 px-6 bg-black text-white rounded-2xl">IR AL CATÁLOGO</Link>
    </div>
  )
}