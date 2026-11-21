// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Pruebas unitarias de la capa de datos con Prisma simulado: comprueban qué
 * se le pide a la base de datos y cómo se transforma la respuesta, sin
 * necesitar PostgreSQL. Las pruebas contra una base de datos real están en
 * guitarras.db.test.ts.
 */

const prisma = vi.hoisted(() => ({
  producto: { findMany: vi.fn(), findFirst: vi.fn() },
  categoria: { findMany: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma }));

const { getCategorias, getGuitarraById, getGuitarras } =
  await import("./guitarras");

const fila = {
  id: 3,
  slug: "om-series-artisan",
  nombre: "OM-Series Artisan",
  marca: "Voltio & Madera",
  precioCentimos: 310_000,
  badge: null,
  imagen: "/guitarras/om-series-artisan.webp",
  descripcion: "Acústica artesanal.",
  specs: ["Tapa de Pícea maciza"],
  categoria: { nombre: "Acústicas" },
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("getGuitarras", () => {
  it("pide solo productos activos, en orden de catálogo", async () => {
    prisma.producto.findMany.mockResolvedValue([fila]);

    await getGuitarras();

    expect(prisma.producto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { activo: true },
        orderBy: { id: "asc" },
      }),
    );
  });

  it("aplana la categoría a su nombre y conserva el precio en céntimos", async () => {
    prisma.producto.findMany.mockResolvedValue([fila]);

    const [guitarra] = await getGuitarras();

    expect(guitarra).toEqual({ ...fila, categoria: "Acústicas" });
    expect(guitarra?.precioCentimos).toBe(310_000);
  });

  it("devuelve una lista vacía si no hay productos publicados", async () => {
    prisma.producto.findMany.mockResolvedValue([]);
    expect(await getGuitarras()).toEqual([]);
  });
});

describe("getGuitarraById", () => {
  it("busca por id entre los productos activos", async () => {
    prisma.producto.findFirst.mockResolvedValue(fila);

    const guitarra = await getGuitarraById(3);

    expect(guitarra?.nombre).toBe("OM-Series Artisan");
    expect(prisma.producto.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 3, activo: true } }),
    );
  });

  it("devuelve null si no existe o está inactivo", async () => {
    prisma.producto.findFirst.mockResolvedValue(null);
    expect(await getGuitarraById(999)).toBeNull();
  });

  it.each([0, -1, 1.5, Number.NaN, 2 ** 53])(
    "no consulta la base de datos con un id inválido (%s)",
    async (id) => {
      expect(await getGuitarraById(id)).toBeNull();
      expect(prisma.producto.findFirst).not.toHaveBeenCalled();
    },
  );
});

describe("getCategorias", () => {
  it("lista solo categorías con productos publicados", async () => {
    prisma.categoria.findMany.mockResolvedValue([
      { nombre: "Acústicas", slug: "acusticas" },
    ]);

    expect(await getCategorias()).toEqual([
      { nombre: "Acústicas", slug: "acusticas" },
    ]);
    expect(prisma.categoria.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { productos: { some: { activo: true } } },
      }),
    );
  });
});
