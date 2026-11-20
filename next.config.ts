import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sin APIs exclusivas de Vercel: la app se sirve con `next build` + `next start`
  // en cualquier servidor Node.
  poweredByHeader: false,
  images: {
    // AVIF primero (más ligero) y WebP como respaldo.
    formats: ["image/avif", "image/webp"],
    // Sin orígenes remotos: las imágenes de producto se sirven desde el propio
    // dominio. `res.cloudinary.com` se añadirá en la Fase 13.
    remotePatterns: [],
  },
};

export default nextConfig;
