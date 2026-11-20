import type { ReactNode } from "react";

// A diferencia del layout, el template se vuelve a montar en cada navegación:
// conserva la animación de entrada por ruta de la Fase 3 (fade + desplazamiento).
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
