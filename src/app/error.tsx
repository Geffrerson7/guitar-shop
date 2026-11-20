"use client";

import { useEffect } from "react";
import ErrorFallback from "@/components/ErrorFallback";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Error inesperado al renderizar la ruta:", error);
  }, [error]);

  return <ErrorFallback onRetry={retry} />;
}
