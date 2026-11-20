import { expect, test } from "@playwright/test";

test.describe("catálogo", () => {
  test("muestra las 12 piezas enlazadas a su detalle", async ({ page }) => {
    await page.goto("/catalogo");

    await expect(
      page.getByRole("heading", { level: 1, name: "Instrumentos de boutique" }),
    ).toBeVisible();
    await expect(page.locator('main a[href^="/producto/"]')).toHaveCount(12);
  });

  test("una tarjeta lleva al detalle de su producto", async ({ page }) => {
    await page.goto("/catalogo");
    await page.getByRole("link", { name: /OM-Series Artisan/ }).click();

    await expect(page).toHaveURL("/producto/3");
    await expect(
      page.getByRole("heading", { level: 1, name: "OM-Series Artisan" }),
    ).toBeVisible();
  });
});

test.describe("detalle de producto", () => {
  test("un id válido responde 200 con nombre, precio y datos estructurados", async ({
    page,
  }) => {
    const response = await page.goto("/producto/3");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle("OM-Series Artisan — Voltio & Madera");
    await expect(page.getByText(/^3100\s€$/)).toBeVisible();

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    expect(JSON.parse(jsonLd ?? "{}")).toMatchObject({
      "@type": "Product",
      name: "OM-Series Artisan",
    });
  });

  test("un id inexistente responde 404 real", async ({ page }) => {
    const response = await page.goto("/producto/999");

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", {
        name: "Esta pieza ya no está en el taller.",
      }),
    ).toBeVisible();
  });

  test("un id no numérico responde 404", async ({ page }) => {
    const response = await page.goto("/producto/abc");
    expect(response?.status()).toBe(404);
  });
});

test("una ruta desconocida muestra la 404 con su código", async ({ page }) => {
  const response = await page.goto("/no-existe");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Esta pieza no está en el catálogo." }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
});

test.describe("sin JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("el catálogo y los bloques con reveal se ven igualmente", async ({
    page,
  }) => {
    await page.goto("/catalogo");
    await expect(page.locator('main a[href^="/producto/"]')).toHaveCount(12);

    await page.goto("/acerca");
    await expect(
      page.getByRole("heading", {
        name: "La obsesión por el detalle, contada sin prisa.",
      }),
    ).toBeVisible();
  });
});

test.describe("con prefers-reduced-motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("todo el contenido es visible sin animar", async ({ page }) => {
    await page.goto("/acerca");

    const bloques = page.locator("[data-reveal]");
    for (const bloque of await bloques.all()) {
      await expect(bloque).toHaveCSS("opacity", "1");
    }
  });
});

test("robots.txt y sitemap.xml están publicados", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Disallow: /admin");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect((await sitemap.text()).match(/<loc>/g)).toHaveLength(16);
});
