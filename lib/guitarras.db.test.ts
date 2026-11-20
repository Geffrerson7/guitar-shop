// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/*
 * Pruebas de integración de la capa de datos contra PostgreSQL real (la base
 * de datos local de docker-compose.yml o el servicio de CI), con el seed
 * aplicado. Se omiten si no hay DATABASE_URL.
 *
 * Los datos auxiliares (un producto inactivo y una categoría vacía) se crean
 * con un sufijo único y se borran al terminar, así que no alteran el seed.
 */

const hayBaseDeDatos = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hayBaseDeDatos)("capa de datos contra PostgreSQL", () => {
  const sufijo = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let datos: typeof import("./guitarras");
  let prisma: (typeof import("./prisma"))["prisma"];
  let idInactivo: number;

  beforeAll(async () => {
    datos = await import("./guitarras");
    ({ prisma } = await import("./prisma"));

    const categoria = await prisma.categoria.create({
      data: { nombre: `Vacía ${sufijo}`, slug: `vacia-${sufijo}` },
    });
    const inactivo = await prisma.producto.create({
      data: {
        slug: `inactivo-${sufijo}`,
        nombre: "Pieza retirada",
        marca: "Pruebas",
        descripcion: "No debe verse en la tienda.",
        precioCentimos: 100,
        imagen: "/guitarras/om-series-artisan.webp",
        specs: [],
        activo: false,
        categoria: { connect: { slug: "acusticas" } },
      },
    });
    idInactivo = inactivo.id;
    // La categoría vacía solo existe para comprobar que no se lista.
    expect(categoria.id).toBeGreaterThan(0);
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.producto.deleteMany({ where: { slug: { endsWith: sufijo } } });
    await prisma.categoria.deleteMany({
      where: { slug: { endsWith: sufijo } },
    });
    await prisma.$disconnect();
  });

  it("devuelve las 12 piezas del seed con ids únicos", async () => {
    const guitarras = await datos.getGuitarras();

    expect(guitarras).toHaveLength(12);
    expect(new Set(guitarras.map((g) => g.id)).size).toBe(12);
    expect(guitarras.map((g) => g.id)).toEqual(
      [...guitarras.map((g) => g.id)].sort((a, b) => a - b),
    );
  });

  it("cada pieza tiene los datos que necesita la interfaz", async () => {
    for (const guitarra of await datos.getGuitarras()) {
      expect(guitarra.nombre).not.toBe("");
      expect(guitarra.marca).not.toBe("");
      expect(guitarra.slug).toMatch(/^[a-z0-9-]+$/);
      expect(Number.isInteger(guitarra.precioCentimos)).toBe(true);
      expect(guitarra.precioCentimos).toBeGreaterThan(0);
      expect(guitarra.imagen).toMatch(/^\/guitarras\/.+\.webp$/);
    }
  });

  it("encuentra una pieza por id", async () => {
    const guitarra = await datos.getGuitarraById(3);

    expect(guitarra).toMatchObject({
      nombre: "OM-Series Artisan",
      categoria: "Acústicas",
      precioCentimos: 310_000,
    });
  });

  it("devuelve null para un id inexistente", async () => {
    expect(await datos.getGuitarraById(999_999)).toBeNull();
  });

  it("oculta los productos inactivos", async () => {
    expect(await datos.getGuitarraById(idInactivo)).toBeNull();
    const ids = (await datos.getGuitarras()).map((g) => g.id);
    expect(ids).not.toContain(idInactivo);
  });

  it("lista las categorías con productos publicados, sin repetir", async () => {
    const categorias = await datos.getCategorias();
    const nombres = categorias.map((c) => c.nombre);

    expect(new Set(nombres).size).toBe(nombres.length);
    expect(nombres).toEqual(
      expect.arrayContaining([
        "Eléctricas",
        "Acústicas",
        "Bajos",
        "Accesorios",
      ]),
    );
    expect(nombres).not.toContain(`Vacía ${sufijo}`);
  });
});
