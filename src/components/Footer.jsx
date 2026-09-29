export default function Footer() {
  return (
    <footer className="w-full bg-stone-800 text-stone-300 py-12 mt-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-amber-200 text-lg font-serif font-bold mb-4">
            Luthier &amp; Co.
          </h3>
          <p className="text-sm text-stone-400">
            Dedicados a los músicos que buscan el alma en su sonido. Desde 1994.
          </p>
        </div>
        <div>
          <h4 className="text-amber-200 text-xs font-bold mb-4 tracking-widest uppercase">Tienda</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-amber-200 cursor-pointer">Guitarras Eléctricas</li>
            <li className="hover:text-amber-200 cursor-pointer">Guitarras Acústicas</li>
            <li className="hover:text-amber-200 cursor-pointer">Bajos</li>
            <li className="hover:text-amber-200 cursor-pointer">Amplificadores</li>
          </ul>
        </div>
        <div>
          <h4 className="text-amber-200 text-xs font-bold mb-4 tracking-widest uppercase">Servicios</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-amber-200 cursor-pointer">Taller de Luthier</li>
            <li className="hover:text-amber-200 cursor-pointer">Tasaciones Vintage</li>
            <li className="hover:text-amber-200 cursor-pointer">Custom Shop</li>
            <li className="hover:text-amber-200 cursor-pointer">Clínicas</li>
          </ul>
        </div>
        <div>
          <h4 className="text-amber-200 text-xs font-bold mb-4 tracking-widest uppercase">Contacto</h4>
          <ul className="space-y-2 text-sm">
            <li>Calle Mayor 12, Madrid</li>
            <li>info@luthierandco.es</li>
            <li>+34 912 345 678</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}