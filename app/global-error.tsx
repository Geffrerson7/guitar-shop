"use client";

import { useEffect } from "react";
import ErrorFallback from "@/components/ErrorFallback";
import { bodoniModa, inter } from "@/lib/fonts";
import "./globals.css";

// Sustituye al layout raíz cuando el error ocurre en él: necesita su propio
// <html> y <body>.
export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Error inesperado en el layout raíz:", error);
  }, [error]);

  return (
    <html lang="es" className={`${bodoniModa.variable} ${inter.variable}`}>
      <body>
        <main id="contenido" className="min-h-screen bg-paper text-ink">
          <ErrorFallback onRetry={retry} />
        </main>
      </body>
    </html>
  );
}
