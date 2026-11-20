import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { bodoniModa, inter } from "@/lib/fonts";
import { siteConfig, siteUrl } from "@/lib/site";
import { shareImage } from "@/lib/seo";
import "./globals.css";

// Metadatos comunes. Cada página aporta su título, descripción y canonical con
// `pageMetadata` (lib/seo.ts). Los iconos salen de los archivos de convención
// de app/ (icon.svg, apple-icon.png). Estos valores cubren las rutas sin
// metadatos propios, como la 404.
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    images: [shareImage],
  },
  twitter: { card: "summary_large_image", images: [shareImage] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: siteConfig.themeColor,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${bodoniModa.variable} ${inter.variable}`}
    >
      <body>
        {/* Sin JavaScript el reveal on scroll no se activa: el contenido
            renderizado en servidor debe verse igualmente. */}
        <noscript>
          <style>
            {"[data-reveal]{opacity:1!important;transform:none!important}"}
          </style>
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
