import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sin APIs exclusivas de Vercel: la app se sirve con `next build` + `next start`
  // en cualquier servidor Node. Las imágenes siguen siendo <img> hasta la Fase 4.
  poweredByHeader: false,
};

export default nextConfig;
