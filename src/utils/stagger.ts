import type { CSSProperties } from "react";

/** Índice de la entrada escalonada (`.stagger-item`) como custom property. */
export function staggerStyle(index: number): CSSProperties {
  return { "--stagger": index } as CSSProperties;
}
