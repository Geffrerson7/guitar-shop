import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// Metadatos mínimos. La Metadata API completa (títulos por ruta, Open Graph,
// sitemap…) llega en la Fase 5.
export const metadata: Metadata = {
  title: "Voltio & Madera",
  description:
    "Luthiería de autor en Madrid desde 1994: instrumentos de boutique elegidos uno a uno y ajustados a mano.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        {/* Sin JavaScript el reveal on scroll no se activa: el contenido
            renderizado en servidor debe verse igualmente. */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <div className="flex min-h-screen flex-col bg-paper text-ink">
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
          >
            Saltar al contenido
          </a>
          <Header />
          <main id="contenido" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
