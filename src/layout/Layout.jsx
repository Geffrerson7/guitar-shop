import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Layout() {
  return (
    <div className="bg-amber-50 text-stone-800 min-h-screen">
      <Header />
      <main className='pt-20'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}