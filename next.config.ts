import type { NextConfig } from "next";
// Valida las variables de entorno al arrancar `next dev` y `next build`
// (Fase 8): si falta DATABASE_URL, el proceso se detiene con un mensaje claro.
import "./env";

const nextConfig: NextConfig = {
  // Sin APIs exclusivas de Vercel: la app se sirve con `next build` + `next start`
  // en cualquier servidor Node.
  poweredByHeader: false,
  images: {
    // AVIF primero (más ligero) y WebP como respaldo.
    formats: ["image/avif", "image/webp"],
    // Sin orígenes remotos: las imágenes de producto se sirven desde
    // `public/guitarras/` (la base de datos guarda la ruta).
    // `res.cloudinary.com` se añadirá en la Fase 13.
    remotePatterns: [],
  },
};

export default nextConfig;
