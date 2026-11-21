"use client";

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

/*
 * Comparte entre los filtros y la lista de resultados una única transición de
 * navegación: los filtros cambian la URL dentro de `startTransition` (la
 * escritura nunca se bloquea) y los resultados se atenúan mientras llega la
 * página nueva del servidor.
 */

type Navegar = (href: string, opciones?: { reemplazar?: boolean }) => void;

const NavegacionContext = createContext<{
  navegar: Navegar;
  pendiente: boolean;
} | null>(null);

export function useNavegacionCatalogo() {
  const contexto = use(NavegacionContext);
  if (!contexto) {
    throw new Error(
      "useNavegacionCatalogo debe usarse dentro de <NavegacionCatalogo>",
    );
  }
  return contexto;
}

export default function NavegacionCatalogo({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();

  const navegar = useCallback<Navegar>(
    (href, { reemplazar = false } = {}) => {
      startTransition(() => {
        // Sin saltar arriba: el visitante sigue en los filtros.
        if (reemplazar) router.replace(href, { scroll: false });
        else router.push(href, { scroll: false });
      });
    },
    [router],
  );

  const valor = useMemo(() => ({ navegar, pendiente }), [navegar, pendiente]);

  return <NavegacionContext value={valor}>{children}</NavegacionContext>;
}

/** Contenedor de los resultados: `aria-busy` y atenuado mientras se navega. */
export function ResultadosCatalogo({ children }: { children: ReactNode }) {
  const { pendiente } = useNavegacionCatalogo();

  return (
    <div
      id="resultados"
      aria-busy={pendiente}
      className={`transition-opacity duration-200 ${pendiente ? "opacity-50" : ""}`}
    >
      {children}
    </div>
  );
}
