import localFont from "next/font/local";

/*
 * Tipografía autoalojada (Fase 3) cargada con next/font/local: precarga,
 * `font-display: swap`, fuente de respaldo con métricas ajustadas para reducir
 * el CLS y URLs con hash cacheables a largo plazo.
 * Dos familias, subset latino, woff2. Presupuesto: ≤ 120 kB (hoy ~95 kB).
 * Las opciones deben ser literales: el cargador las lee en tiempo de compilación.
 */

export const bodoniModa = localFont({
  src: "../assets/fonts/bodoni-moda-latin.woff2",
  weight: "400 900",
  style: "normal",
  display: "swap",
  variable: "--font-bodoni",
  fallback: ["Times New Roman", "ui-serif", "Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

export const inter = localFont({
  src: "../assets/fonts/inter-latin.woff2",
  weight: "400 600",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
  adjustFontFallback: "Arial",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});
