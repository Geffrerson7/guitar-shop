"use client";

import type { HTMLAttributes } from "react";
import { useReveal } from "@/hooks/useReveal";

/**
 * Frontera de cliente mínima para el reveal on scroll: permite que las
 * páginas sigan siendo Server Components y solo este envoltorio se hidrate.
 */
export default function Reveal(props: HTMLAttributes<HTMLDivElement>) {
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} data-reveal="" {...props} />;
}
