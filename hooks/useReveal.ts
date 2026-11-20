"use client";

import { useEffect, useRef } from "react";

/**
 * Reveal on scroll sin librerías: marca el nodo como visible la primera vez
 * que entra en el viewport. Si no hay IntersectionObserver, lo muestra.
 * Con `prefers-reduced-motion: reduce` el CSS ya deja el contenido visible.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      node.dataset.reveal = "visible";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            entry.target.dataset.reveal = "visible";
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}
