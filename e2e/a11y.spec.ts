import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/*
 * Auditoría automática con axe sobre las 6 rutas públicas (deuda declarada
 * en el cierre de la Fase 2). Falla ante cualquier violación grave o crítica
 * de WCAG 2.2 A/AA; las moderadas y menores se adjuntan al informe.
 */
const rutas = [
  "/",
  "/catalogo",
  "/producto/3",
  "/acerca",
  "/contacto",
  "/no-existe",
];

// Sin animaciones: axe no debe evaluar contenido a mitad de un fade.
test.use({ reducedMotion: "reduce" });

for (const ruta of rutas) {
  test(`sin violaciones graves de accesibilidad en ${ruta}`, async ({
    page,
  }, testInfo) => {
    await page.goto(ruta);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      // Texto puramente decorativo (marca de agua del footer, aria-hidden):
      // WCAG 1.4.3 lo exime del requisito de contraste.
      .exclude("[data-decorativo]")
      .analyze();

    await testInfo.attach("axe-results", {
      body: JSON.stringify(results.violations, null, 2),
      contentType: "application/json",
    });

    const graves = results.violations
      .filter((v) => v.impact === "critical" || v.impact === "serious")
      .map((v) => ({
        id: v.id,
        impact: v.impact,
        nodos: v.nodes.map((n) => n.target.join(" ")),
      }));

    expect(graves).toEqual([]);
  });
}
