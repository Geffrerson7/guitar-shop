import { expect, test, type Page } from "@playwright/test";

/*
 * Búsqueda, filtros, orden y paginación del catálogo (Fase 9). El estado vive
 * en la URL: cada prueba comprueba la URL resultante, no solo la pantalla.
 */

const tarjetas = (page: Page) => page.locator('main a[href^="/producto/"]');
const contador = (page: Page) => page.locator('main [aria-live="polite"]');
const busqueda = (page: Page) =>
  page.getByRole("searchbox", { name: "Buscar" });

test.describe("con JavaScript", () => {
  test("la búsqueda actualiza la URL y los resultados mientras se escribe", async ({
    page,
  }) => {
    await page.goto("/catalogo");
    await busqueda(page).fill("gíbson");

    await expect(page).toHaveURL(/\/catalogo\?q=g%C3%ADbson$/);
    await expect(contador(page)).toHaveText("2 piezas coinciden");
    await expect(tarjetas(page)).toHaveCount(2);
    // La escritura no se interrumpe: el campo conserva el foco y el texto.
    await expect(busqueda(page)).toBeFocused();
    await expect(busqueda(page)).toHaveValue("gíbson");
  });

  test("un filtro se deshace con el botón Atrás", async ({ page }) => {
    await page.goto("/catalogo");
    const categoria = page.getByLabel("Categoría");

    await categoria.selectOption("bajos");
    await expect(page).toHaveURL("/catalogo?categoria=bajos");
    await expect(contador(page)).toHaveText("1 pieza coincide");

    await page.goBack();
    await expect(page).toHaveURL("/catalogo");
    await expect(contador(page)).toContainText("12 piezas disponibles");
    await expect(categoria).toHaveValue("");
  });

  test("ordena por precio", async ({ page }) => {
    await page.goto("/catalogo");
    await page.getByLabel("Ordenar por").selectOption("precio-asc");

    await expect(page).toHaveURL("/catalogo?orden=precio-asc");
    await expect(tarjetas(page).first()).toHaveText("Deluxe Drive Bundle");
  });

  test("pagina conservando los filtros", async ({ page }) => {
    await page.goto("/catalogo?orden=nombre");
    const paginacion = page.getByRole("navigation", {
      name: "Paginación del catálogo",
    });

    await paginacion.getByRole("link", { name: "Página 2" }).click();
    await expect(page).toHaveURL("/catalogo?orden=nombre&pagina=2");
    await expect(tarjetas(page)).toHaveCount(4);
    await expect(contador(page)).toContainText("página 2 de 2");
    await expect(
      paginacion.getByRole("link", { name: "Página 2" }),
    ).toHaveAttribute("aria-current", "page");

    await paginacion.getByRole("link", { name: "← Anterior" }).click();
    await expect(page).toHaveURL("/catalogo?orden=nombre");
    await expect(tarjetas(page)).toHaveCount(8);
  });

  test("sin resultados ofrece limpiar los filtros", async ({ page }) => {
    await page.goto("/catalogo");
    await busqueda(page).fill("zzz");

    await expect(
      page.getByRole("heading", { name: "Nada por aquí con esos criterios." }),
    ).toBeVisible();
    await expect(contador(page)).toHaveText("Ninguna pieza coincide");

    await page
      .getByRole("main")
      .getByRole("link", { name: "Limpiar filtros" })
      .last()
      .click();
    await expect(page).toHaveURL("/catalogo");
    await expect(tarjetas(page)).toHaveCount(8);
    await expect(busqueda(page)).toHaveValue("");
  });
});

test("una URL con filtros se reproduce tal cual en otra pestaña", async ({
  page,
}) => {
  await page.goto(
    "/catalogo?categoria=electricas&precioMin=4000&orden=precio-desc",
  );

  await expect(page.getByLabel("Categoría")).toHaveValue("electricas");
  await expect(page.getByLabel("Precio mínimo en euros")).toHaveValue("4000");
  await expect(page.getByLabel("Ordenar por")).toHaveValue("precio-desc");
  await expect(contador(page)).toHaveText("4 piezas coinciden");
  await expect(tarjetas(page).first()).toHaveText("1964 Gibson ES-335");
});

test("parámetros inválidos no rompen la página", async ({ page }) => {
  const response = await page.goto(
    "/catalogo?pagina=abc&orden=hack&categoria=../admin&precioMin=-1",
  );

  expect(response?.status()).toBe(200);
  await expect(tarjetas(page)).toHaveCount(8);
});

test("las categorías del footer llevan al catálogo filtrado", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Guitarras acústicas" })
    .click();

  await expect(page).toHaveURL("/catalogo?categoria=acusticas");
  await expect(contador(page)).toHaveText("3 piezas coinciden");
});

test.describe("sin JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("el formulario filtra al enviarse", async ({ page }) => {
    await page.goto("/catalogo");
    await busqueda(page).fill("gibson");
    await page.getByLabel("Marca").selectOption("Gibson");
    await page.getByRole("button", { name: "Aplicar" }).click();

    await expect(page).toHaveURL(/[?&]q=gibson/);
    await expect(page).toHaveURL(/[?&]marca=Gibson/);
    await expect(contador(page)).toHaveText("1 pieza coincide");
    await expect(tarjetas(page)).toHaveText(["Black Beauty Custom"]);
  });

  test("la paginación funciona con enlaces normales", async ({ page }) => {
    await page.goto("/catalogo");
    await page.getByRole("link", { name: "Siguiente →" }).click();

    await expect(page).toHaveURL("/catalogo?pagina=2");
    await expect(tarjetas(page)).toHaveCount(4);
  });
});
