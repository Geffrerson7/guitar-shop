import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/*
 * Carrito persistente (Fase 10). Cada prueba tiene su propio contexto de
 * navegador y, por tanto, su propio localStorage.
 *
 * Datos del seed: la OM-Series Artisan (id 3) cuesta 3100 € y tiene 2
 * unidades; la 1964 Gibson ES-335 (id 2), 8900 € y 1 unidad.
 */

const CLAVE = "voltio-madera:carrito:v1";

/** Importe tal como lo formatea es-ES: «3100 €», «12.000 €» (miles desde 5 cifras). */
function precio(texto: string): RegExp {
  return new RegExp(`^${texto.replace(".", "\\.")}\\s€$`);
}

async function anadirDesdeDetalle(page: Page, id: number) {
  await page.goto(`/producto/${id}`);
  await page.getByRole("button", { name: "Añadir al carrito" }).click();
  await expect(page.getByText(/En tu carrito:/)).toBeVisible();
}

/** Errores de consola y de página, incluidos los de hidratación. */
function vigilarErrores(page: Page): string[] {
  const errores: string[] = [];
  page.on("console", (mensaje) => {
    if (mensaje.type() === "error") errores.push(mensaje.text());
  });
  page.on("pageerror", (error) => errores.push(error.message));
  return errores;
}

test("añadir desde el detalle actualiza el contador y la página del carrito", async ({
  page,
}) => {
  const errores = vigilarErrores(page);
  await page.goto("/producto/3");

  // Con teclado: foco en el botón y Enter.
  const boton = page.getByRole("button", { name: "Añadir al carrito" });
  await boton.focus();
  await page.keyboard.press("Enter");

  await expect(page.getByText("En tu carrito: 1 artículo")).toBeVisible();
  await expect(page.getByRole("status")).toContainText(
    "OM-Series Artisan añadido al carrito",
  );
  const enlaceCarrito = page.getByRole("link", {
    name: "Carrito, 1 artículo",
  });
  await expect(enlaceCarrito).toBeVisible();

  await enlaceCarrito.click();
  await expect(page).toHaveURL("/carrito");
  await expect(
    page.getByRole("link", { name: "OM-Series Artisan" }),
  ).toBeVisible();
  await expect(page.getByTestId("total-carrito")).toHaveText(precio("3100"));

  expect(errores).toEqual([]);
});

test("modificar, respetar el stock y quitar", async ({ page }) => {
  await anadirDesdeDetalle(page, 3);
  await page.goto("/carrito");

  const sumar = page.getByRole("button", {
    name: "Sumar una unidad de OM-Series Artisan",
  });
  const restar = page.getByRole("button", {
    name: "Restar una unidad de OM-Series Artisan",
  });

  await sumar.click();
  await expect(page.getByTestId("cantidad")).toHaveText("2");
  await expect(page.getByTestId("total-carrito")).toHaveText(precio("6200"));

  // Stock 2: no se puede pasar de ahí.
  await expect(sumar).toHaveAttribute("aria-disabled", "true");
  await sumar.click({ force: true });
  await expect(page.getByTestId("cantidad")).toHaveText("2");
  await expect(
    page.getByText("No hay más unidades disponibles."),
  ).toBeVisible();

  await restar.click();
  await expect(page.getByTestId("cantidad")).toHaveText("1");
  await expect(restar).toHaveAttribute("aria-disabled", "true");

  await page
    .getByRole("button", { name: "Eliminar OM-Series Artisan del carrito" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Tu carrito está vacío." }),
  ).toBeFocused();
  await expect(
    page.getByRole("link", { name: "Carrito, vacío" }),
  ).toBeVisible();
});

test("el detalle no deja añadir más unidades que el stock", async ({
  page,
}) => {
  await anadirDesdeDetalle(page, 2);
  await expect(
    page.getByRole("button", { name: "Ya tienes todas las unidades" }),
  ).toBeDisabled();

  await page.reload();
  await expect(
    page.getByRole("button", { name: "Ya tienes todas las unidades" }),
  ).toBeDisabled();
});

test("persiste al recargar y al cerrar y reabrir el navegador", async ({
  page,
  browser,
}) => {
  await anadirDesdeDetalle(page, 3);
  await anadirDesdeDetalle(page, 2);

  await page.reload();
  await expect(
    page.getByRole("link", { name: "Carrito, 2 artículos" }),
  ).toBeVisible();

  // «Cerrar y reabrir»: un contexto nuevo con el almacenamiento del anterior.
  const estado = await page.context().storageState();
  await page.context().close();
  const reabierto = await browser.newContext({ storageState: estado });
  const nueva = await reabierto.newPage();
  await nueva.goto("/carrito");

  await expect(nueva.getByText("2 piezas en tu carrito")).toBeVisible();
  await expect(nueva.getByTestId("total-carrito")).toHaveText(precio("12.000"));
  await reabierto.close();
});

test("se sincroniza entre pestañas", async ({ page, context }) => {
  await page.goto("/carrito");
  await expect(
    page.getByRole("heading", { name: "Tu carrito está vacío." }),
  ).toBeVisible();

  const otra = await context.newPage();
  await anadirDesdeDetalle(otra, 3);

  // La primera pestaña recibe el evento `storage` sin recargar.
  await expect(
    page.getByRole("link", { name: "OM-Series Artisan" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Carrito, 1 artículo" }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Eliminar OM-Series Artisan del carrito" })
    .click();
  await expect(
    otra.getByRole("link", { name: "Carrito, vacío" }),
  ).toBeVisible();
});

test.describe("localStorage manipulado", () => {
  test("un precio inyectado no altera los importes", async ({ page }) => {
    await page.addInitScript((clave) => {
      localStorage.setItem(
        clave,
        JSON.stringify({
          v: 1,
          lineas: [
            { productoId: 3, cantidad: 1, precioCentimos: 1, precio: 0.01 },
          ],
        }),
      );
    }, CLAVE);

    await page.goto("/carrito");
    await expect(page.getByTestId("total-carrito")).toHaveText(precio("3100"));
  });

  test("un id inexistente se señala y no bloquea el resto", async ({
    page,
  }) => {
    const errores = vigilarErrores(page);
    await page.addInitScript((clave) => {
      localStorage.setItem(
        clave,
        JSON.stringify({
          v: 1,
          lineas: [
            { productoId: 999999, cantidad: 1 },
            { productoId: 3, cantidad: 5 },
          ],
        }),
      );
    }, CLAVE);

    await page.goto("/carrito");
    await expect(
      page.getByText("Esta pieza ya no está a la venta. No entra en el total."),
    ).toBeVisible();
    // Se pidieron 5 de la OM-Series y solo hay 2: se cuentan 2.
    await expect(page.getByText(/Solo quedan 2 unidades/)).toBeVisible();
    await expect(page.getByTestId("total-carrito")).toHaveText(precio("6200"));

    await page.getByRole("button", { name: "Ajustar a 2" }).click();
    await expect(page.getByTestId("cantidad")).toHaveText("2");
    await expect(page.getByText(/Solo quedan/)).toHaveCount(0);

    await page
      .getByRole("button", {
        name: "Eliminar pieza no disponible del carrito",
      })
      .click();
    await expect(page.getByText("1 pieza en tu carrito")).toBeVisible();
    expect(errores).toEqual([]);
  });

  test.describe("contenido corrupto", () => {
    for (const valor of ["{no es json", '{"v":0,"lineas":[]}', "[1,2,3]"]) {
      test(`se trata como carrito vacío: ${valor}`, async ({ page }) => {
        await page.addInitScript(
          ([clave, texto]) => localStorage.setItem(clave!, texto!),
          [CLAVE, valor],
        );

        await page.goto("/carrito");
        await expect(
          page.getByRole("heading", { name: "Tu carrito está vacío." }),
        ).toBeVisible();
      });
    }
  });
});

test("la API rechaza ids inválidos sin error 500", async ({ request }) => {
  const invalida = await request.get("/api/carrito?ids=abc");
  expect(invalida.status()).toBe(400);

  const valida = await request.get("/api/carrito?ids=3,999999");
  expect(valida.ok()).toBe(true);
  const { productos } = await valida.json();
  expect(productos).toEqual([
    expect.objectContaining({ id: 3, precioCentimos: 310_000, stock: 2 }),
  ]);
});

test("/carrito no se indexa", async ({ page }) => {
  await page.goto("/carrito");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});

test.describe("accesibilidad", () => {
  test.use({ reducedMotion: "reduce" });

  test("sin violaciones graves con el carrito lleno", async ({ page }) => {
    await anadirDesdeDetalle(page, 3);
    await page.goto("/carrito");
    await expect(page.getByTestId("total-carrito")).toHaveText(precio("3100"));

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .exclude("[data-decorativo]")
      .analyze();
    const graves = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(graves.map((v) => v.id)).toEqual([]);
  });
});
