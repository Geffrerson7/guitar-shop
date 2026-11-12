import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Layout() {
  return (
    <div className="bg-amber-50 text-stone-800 min-h-screen">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-stone-800 focus:px-4 focus:py-2 focus:text-amber-50"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" tabIndex={-1} className='pt-20'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
