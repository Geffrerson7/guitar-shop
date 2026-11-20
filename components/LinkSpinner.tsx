"use client";

import type { ReactNode } from "react";
import { useLinkStatus } from "next/link";

/**
 * Texto de un enlace con un spinner que aparece mientras su navegación está
 * pendiente (`useLinkStatus`). Debe ir **dentro** de un `<Link>`.
 *
 * Por qué así y no con `loading.tsx`: un límite de Suspense en el catálogo
 * mete el esqueleto en el HTML prerenderizado y deja las tarjetas detrás de
 * un script, de modo que sin JavaScript la página saldría vacía. Este
 * indicador vive en el enlace de origen y no toca el HTML del destino.
 *
 * - Con el prefetch activo (por defecto) la página suele estar ya precargada
 *   y el spinner no llega a verse: aparece justo cuando hace falta, en redes
 *   lentas o si se pulsa antes de que termine la precarga.
 * - Sin saltos de layout: el spinner está siempre renderizado, en posición
 *   absoluta a la derecha del texto, y solo cambia su opacidad. El retardo de
 *   la transición evita un parpadeo en navegaciones casi instantáneas.
 * - Decorativo (`aria-hidden`): no altera el nombre accesible del enlace.
 * - Con `prefers-reduced-motion` no gira; se muestra como un arco fijo.
 */
export default function LinkSpinner({ children }: { children: ReactNode }) {
  const { pending } = useLinkStatus();

  return (
    <span className="relative inline-block">
      {children}
      <span
        aria-hidden="true"
        data-pending={pending}
        className="pointer-events-none absolute top-1/2 left-full ml-1.5 size-3 -translate-y-1/2 rounded-full border-2 border-current border-r-transparent opacity-0 transition-opacity duration-150 data-[pending=true]:opacity-100 data-[pending=true]:delay-100 motion-safe:animate-spin"
      />
    </span>
  );
}
