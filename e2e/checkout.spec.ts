import AxeBuilder from "@axe-core/playwright";
import { test as base, expect, type Page } from "@playwright/test";
import { cerrarDb, limpiarPedidos, pedidosDe, stockDe } from "./db";

/*
 * Checkout simulado y registro de pedidos (Fase 11).
 *
 * Cada proyecto compra su propia pieza, que ninguna otra prueba usa: el
 * Deluxe Drive Bundle (id 10, 8 unidades en el seed) en escritorio y el Royal
 * Reverb Combo (id 9, 4 unidades) en móvil. Las pruebas de este archivo van
 * en orden dentro de cada proyecto, así que el stock es exacto. Cada prueba
 * usa un email y una IP propios; al terminar se devuelve el stock y se borran
 * sus pedidos (e2e/db.ts).
 */

base.describe.configure({ mode: "default" });

const CLAVE = "voltio-madera:carrito:v1";

interface Pieza {
  id: number;
  nombre: string;
  busqueda: string;
  /** Como lo formatea es-ES. */
  euros: string;
  centimos: number;
}

const piezas: Record<string, Pieza> = {
  desktop: {
    id: 10,
    nombre: "Deluxe Drive Bundle",
    busqueda: "deluxe",
    euros: "450",
    centimos: 45_000,
  },
  mobile: {
    id: 9,
    nombre: "Royal Reverb Combo",
    busqueda: "royal",
    euros: "1890",
    centimos: 189_000,
  },
};

const test = base.extend<{ email: string; pieza: Pieza }>({
  // `usar` y no `use`: la regla de hooks de React confunde el nombre.
  pieza: async ({}, usar, testInfo) => {
    await usar(piezas[testInfo.project.name]!);
  },

  email: async ({ page }, usar, testInfo) => {
    const sufijo = `${testInfo.project.name}-${testInfo.workerIndex}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const email = `e2e+${sufijo}@example.com`;
    // Una IP por prueba: la limitación de frecuencia cuenta por IP.
    const octeto = () => Math.floor(Math.random() * 254) + 1;
    await page.setExtraHTTPHeaders({
      "x-forwarded-for": `10.${octeto()}.${octeto()}.${octeto()}`,
    });
    await usar(email);
    await limpiarPedidos(email);
  },
});

test.afterAll(async () => {
  await cerrarDb();
});

/** Precio tal como lo formatea es-ES: «450 €». */
function precio(euros: string): RegExp {
  return new RegExp(`^${euros.replace(".", "\\.")}\\s€$`);
}

/** Carrito inicial, solo en la primera carga (vaciarlo debe persistir). */
async function carritoInicial(
  page: Page,
  lineas: { productoId: number; cantidad: number }[],
) {
  await page.addInitScript(
    ([clave, texto]) => {
      if (sessionStorage.getItem("e2e:carrito")) return;
      sessionStorage.setItem("e2e:carrito", "1");
      localStorage.setItem(clave!, texto!);
    },
    [CLAVE, JSON.stringify({ v: 1, lineas })],
  );
}

async function rellenar(page: Page, email: string) {
  await page.getByLabel("Nombre y apellidos").fill("Ana López");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Dirección").fill("Calle Mayor 12, 3.º B");
  await page.getByLabel("Código postal").fill("28013");
  await page.getByLabel("Localidad").fill("Madrid");
  await page.getByLabel("Provincia").fill("Madrid");
  await page.getByRole("checkbox", { name: /aviso de privacidad/ }).check();
}

/** Texto de stock del detalle (mismo criterio que la página). */
function textoStock(stock: number): string {
  if (stock <= 0) return "Agotada por ahora";
  if (stock === 1) return "Última unidad disponible";
  return `${stock} unidades disponibles`;
}

function botonConfirmar(page: Page) {
  return page.getByRole("button", { name: /^Confirmar pedido/ });
}

test("flujo completo: catálogo → carrito → checkout → confirmación, con teclado", async ({
  page,
  email,
  pieza,
}) => {
  const errores: string[] = [];
  page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  page.on("pageerror", (error) => errores.push(error.message));
  const externas: string[] = [];
  page.on("request", (peticion) => {
    const { hostname } = new URL(peticion.url());
    if (hostname !== "localhost") externas.push(peticion.url());
  });
  const stockAntes = await stockDe(pieza.id);

  await page.goto(`/catalogo?q=${pieza.busqueda}`);
  await page.getByRole("link", { name: pieza.nombre }).click();
  await expect(page).toHaveURL(`/producto/${pieza.id}`);
  await page.getByRole("button", { name: "Añadir al carrito" }).click();
  await page.getByRole("link", { name: "Carrito, 1 artículo" }).click();

  await expect(page.getByTestId("total-carrito")).toHaveText(
    precio(pieza.euros),
  );
  await page.getByRole("link", { name: "Finalizar compra" }).click();
  await expect(page).toHaveURL("/checkout");
  await expect(
    page.getByText("Pago simulado — no se realiza ningún cargo."),
  ).toBeVisible();
  await expect(page.getByTestId("total-checkout")).toHaveText(
    precio(pieza.euros),
  );

  // Solo teclado: Tab entre campos, espacio en la casilla, Enter al final.
  await page.getByLabel("Nombre y apellidos").focus();
  for (const valor of [
    "Ana López",
    email,
    "", // teléfono (opcional)
    "Calle Mayor 12, 3.º B",
    "28013",
    "Madrid",
    "Madrid",
  ]) {
    if (valor) await page.keyboard.type(valor);
    await page.keyboard.press("Tab");
  }
  await expect(
    page.getByRole("checkbox", { name: /aviso de privacidad/ }),
  ).toBeFocused();
  await page.keyboard.press("Space");
  await page.keyboard.press("Tab"); // enlace al aviso de privacidad
  await page.keyboard.press("Tab");
  await expect(botonConfirmar(page)).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/pedido\/VM-[0-9A-Z-]{19}$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Gracias, Ana." }),
  ).toBeVisible();
  await expect(
    page.getByText("Pago simulado — no se ha realizado ningún cargo."),
  ).toBeVisible();
  await expect(page.getByTestId("total-pedido")).toHaveText(
    precio(pieza.euros),
  );
  // El carrito se vacía al confirmarse, también tras recargar.
  await expect(
    page.getByRole("link", { name: "Carrito, vacío" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Carrito, vacío" }),
  ).toBeVisible();

  const codigo = await page.getByTestId("codigo-pedido").textContent();
  expect(await pedidosDe(email)).toEqual([
    {
      codigo,
      estado: "confirmado",
      totalCentimos: pieza.centimos,
      lineas: [
        {
          productoId: pieza.id,
          precioUnitarioCentimos: pieza.centimos,
          cantidad: 1,
        },
      ],
    },
  ]);
  expect(await stockDe(pieza.id)).toBe(stockAntes - 1);

  // El detalle ya refleja el stock nuevo (la acción invalida su caché).
  await page.goto(`/producto/${pieza.id}`);
  await expect(page.getByText(textoStock(stockAntes - 1))).toBeVisible();

  // Ninguna petición sale de la infraestructura propia.
  expect(externas).toEqual([]);
  // Sin avisos de hidratación ni errores en todo el recorrido.
  expect(errores).toEqual([]);
});

test("errores por campo: asociados al campo y foco en el primero", async ({
  page,
  email,
  pieza,
}) => {
  await carritoInicial(page, [{ productoId: pieza.id, cantidad: 1 }]);
  await page.goto("/checkout");
  await expect(page.getByTestId("total-checkout")).toHaveText(
    precio(pieza.euros),
  );

  await botonConfirmar(page).click();
  const nombre = page.getByLabel("Nombre y apellidos");
  await expect(nombre).toBeFocused();
  await expect(nombre).toHaveAttribute("aria-invalid", "true");
  await expect(nombre).toHaveAccessibleDescription(
    "Escribe tu nombre y apellidos.",
  );
  await expect(
    page.getByRole("checkbox", { name: /aviso de privacidad/ }),
  ).toHaveAccessibleDescription(/consentimiento/);

  // Lo escrito se conserva y el foco pasa al siguiente error.
  await nombre.fill("Ana López");
  await page.getByLabel("Email").fill("ana@");
  await page.getByLabel("Código postal").fill("07001");
  await botonConfirmar(page).click();
  const campoEmail = page.getByLabel("Email");
  await expect(campoEmail).toBeFocused();
  await expect(campoEmail).toHaveAccessibleDescription(/Revisa el email/);
  await expect(nombre).toHaveValue("Ana López");
  await expect(nombre).not.toHaveAttribute("aria-invalid");
  await expect(page.getByLabel("Código postal")).toHaveAccessibleDescription(
    /solo enviamos a la península/,
  );

  expect(await pedidosDe(email)).toEqual([]);
});

test("un precio alterado en el navegador no cambia lo que se cobra", async ({
  page,
  email,
  pieza,
}) => {
  await carritoInicial(page, [{ productoId: pieza.id, cantidad: 1 }]);
  // El navegador «cree» que la pieza cuesta 1 céntimo.
  await page.route("**/api/carrito?*", async (ruta) => {
    const respuesta = await ruta.fetch();
    const { productos } = await respuesta.json();
    await ruta.fulfill({
      response: respuesta,
      json: {
        productos: productos.map((p: object) => ({ ...p, precioCentimos: 1 })),
      },
    });
  });

  await page.goto("/checkout");
  await expect(page.getByTestId("total-checkout")).toHaveText(precio("0"));
  await rellenar(page, email);
  await botonConfirmar(page).click();

  await expect(page.getByTestId("total-pedido")).toHaveText(
    precio(pieza.euros),
  );
  const [pedido] = await pedidosDe(email);
  expect(pedido).toMatchObject({
    totalCentimos: pieza.centimos,
    lineas: [{ precioUnitarioCentimos: pieza.centimos }],
  });
});

test("cantidades por encima del stock: no se crea el pedido y se dice qué línea falla", async ({
  page,
  email,
  pieza,
}) => {
  await carritoInicial(page, [{ productoId: pieza.id, cantidad: 50 }]);
  // El navegador «cree» que hay stock de sobra.
  await page.route("**/api/carrito?*", async (ruta) => {
    const respuesta = await ruta.fetch();
    const { productos } = await respuesta.json();
    await ruta.fulfill({
      response: respuesta,
      json: { productos: productos.map((p: object) => ({ ...p, stock: 99 })) },
    });
  });
  const stockAntes = await stockDe(pieza.id);

  await page.goto("/checkout");
  await rellenar(page, email);
  await botonConfirmar(page).click();

  // (El anunciador de rutas de Next.js también es un `role="alert"`.)
  const aviso = page
    .getByRole("alert")
    .filter({ hasText: "No hemos creado el pedido" });
  await expect(aviso).toBeVisible();
  await expect(aviso).toContainText(
    new RegExp(`${pieza.nombre}: solo quedan \\d+ unidades`),
  );
  await expect(aviso).toBeFocused();
  await expect(page).toHaveURL("/checkout");
  expect(await pedidosDe(email)).toEqual([]);
  expect(await stockDe(pieza.id)).toBe(stockAntes);
});

test("enviar dos veces el formulario crea un solo pedido", async ({
  page,
  email,
  pieza,
}) => {
  await carritoInicial(page, [{ productoId: pieza.id, cantidad: 1 }]);
  await page.goto("/checkout");
  await rellenar(page, email);

  // Doble clic y, además, dos envíos seguidos del formulario.
  await botonConfirmar(page).dblclick();
  await page.locator("form").evaluate((form: HTMLFormElement) => {
    form.requestSubmit();
    form.requestSubmit();
  });

  await expect(page).toHaveURL(/\/pedido\/VM-/);
  expect(await pedidosDe(email)).toHaveLength(1);
});

test("el carrito solo abre el checkout si todas las líneas se pueden comprar", async ({
  page,
}) => {
  await carritoInicial(page, [{ productoId: 3, cantidad: 5 }]);
  await page.goto("/carrito");

  await expect(
    page.getByRole("button", { name: "Finalizar compra" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Ajusta o elimina las piezas señaladas para continuar."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Ajustar a 2" }).click();
  await expect(
    page.getByRole("link", { name: "Finalizar compra" }),
  ).toHaveAttribute("href", "/checkout");
});

test("con el carrito vacío, el checkout lleva al catálogo", async ({
  page,
}) => {
  await page.goto("/checkout");
  await expect(
    page.getByRole("heading", { name: "Tu carrito está vacío." }),
  ).toBeVisible();
  await expect(botonConfirmar(page)).toHaveCount(0);
});

test("checkout y confirmación no se indexan; un código inválido da 404", async ({
  page,
}) => {
  await page.goto("/checkout");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );

  const respuesta = await page.goto("/pedido/VM-0000-0000-0000-0000");
  expect(respuesta?.status()).toBe(404);
  const malFormado = await page.goto("/pedido/1");
  expect(malFormado?.status()).toBe(404);
});

test("el aviso de privacidad nombra a los proveedores y la región", async ({
  page,
}) => {
  await page.goto("/privacidad");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/Vercel/).first()).toBeVisible();
  await expect(page.getByText(/Neon/).first()).toBeVisible();
  await expect(page.getByText(/Fráncfort/)).toBeVisible();
  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "Privacidad" }),
  ).toHaveAttribute("href", "/privacidad");
});

test.describe("accesibilidad", () => {
  test.use({ reducedMotion: "reduce" });

  async function sinViolacionesGraves(page: Page) {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .exclude("[data-decorativo]")
      .analyze();
    const graves = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(graves.map((v) => v.id)).toEqual([]);
  }

  test("checkout lleno, con errores y confirmación", async ({
    page,
    email,
    pieza,
  }) => {
    await carritoInicial(page, [{ productoId: pieza.id, cantidad: 1 }]);
    await page.goto("/checkout");
    await expect(page.getByTestId("total-checkout")).toHaveText(
      precio(pieza.euros),
    );
    await sinViolacionesGraves(page);

    await botonConfirmar(page).click();
    await expect(page.getByLabel("Nombre y apellidos")).toBeFocused();
    await sinViolacionesGraves(page);

    await rellenar(page, email);
    await botonConfirmar(page).click();
    await expect(page).toHaveURL(/\/pedido\/VM-/);
    await expect(page.getByTestId("total-pedido")).toBeVisible();
    await sinViolacionesGraves(page);
  });
});
