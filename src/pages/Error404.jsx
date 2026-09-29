import { Link } from "react-router-dom"

export default function Error404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <h1 className="text-7xl font-bold text-amber-700 mb-4">404</h1>
      <p className="text-xl text-stone-600 mb-8">Página no encontrada</p>
      
      <img src="https://cataas.com/cat" alt="imagen aleatoria de un gato" className="rounded-2xl w-64 mb-5"/>
      <Link to="/" className="text-amber-50 bg-amber-700 hover:bg-amber-800 text-lg py-2 px-6 rounded-2xl">Ir al inicio</Link>
    </div>
  )
}