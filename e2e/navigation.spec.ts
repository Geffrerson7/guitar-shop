import { expect, test } from "@playwright/test";

/*
 * Indicador de navegación pendiente hacia el catálogo (`LinkSpinner`).
 * Se retrasan las peticiones RSC del catálogo para simular una red lenta en
 * la que el prefetch no ha terminado cuando se pulsa el enlace.
 */
test("los enlaces al catálogo muestran un spinner mientras la navegación está pendiente", async ({
  page,
}) => {
  await page.route(/\/catalogo.*_rsc=/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await route.continue();
  });

  await page.goto("/");
  const enlace = page.getByRole("link", { name: "Explorar el catálogo" });
  const spinner = enlace.locator("[data-pending]");

  await expect(spinner).toHaveAttribute("data-pending", "false");
  await expect(spinner).toHaveCSS("opacity", "0");
  const antes = await enlace.boundingBox();

  await enlace.click();

  await expect(spinner).toHaveAttribute("data-pending", "true");
  await expect(spinner).toHaveCSS("opacity", "1");
  // Sin saltos de layout: el enlace conserva su tamaño.
  const durante = await enlace.boundingBox();
  expect([durante?.width, durante?.height]).toEqual([
    antes?.width,
    antes?.height,
  ]);

  await expect(page).toHaveURL("/catalogo", { timeout: 10_000 });
  await expect(page.locator('main a[href^="/producto/"]')).toHaveCount(8);
});
