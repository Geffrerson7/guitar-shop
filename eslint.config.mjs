import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Accesibilidad (TEST-02): eslint-config-next ya registra el plugin
      // jsx-a11y pero solo activa 6 reglas; aquí se aplica el conjunto
      // recomendado completo.
      ...jsxA11y.flatConfigs.recommended.rules,
      // Fase 7: sin `any` explícito ni supresiones de tipos.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": "error",
    },
  },
  // Siempre al final: desactiva las reglas de estilo que decide Prettier.
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    "generated/**",
  ]),
]);
