// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_LINEAS } from "@/features/carrito/reducer";

const prisma = vi.hoisted(() => ({ producto: { findMany: vi.fn() } }));
vi.mock("@/lib/prisma", () => ({ prisma }));

const { getProductosCarrito, parseIdsCarrito } = await import("./carrito");

beforeEach(() => {
  vi.resetAllMocks();
});

describe("parseIdsCarrito", () => {
  it("acepta una lista de ids y la ordena sin repetir", () => {
    expect(parseIdsCarrito("12,3,3,1")).toEqual([1, 3, 12]);
  });

  it.each([null, "", "  "])("sin ids devuelve una lista vacía (%j)", (v) => {
    expect(parseIdsCarrito(v)).toEqual([]);
  });

  it.each(["0", "-1", "1.5", "abc", "1,,2", "1, 2", "01", "99999999999999999"])(
    "rechaza un valor inválido (%s)",
    (valor) => {
      expect(parseIdsCarrito(valor)).toBeNull();
    },
  );

  it("rechaza más ids de los que caben en un carrito", () => {
    const ids = Array.from({ length: MAX_LINEAS + 1 }, (_, i) => i + 1);
    expect(parseIdsCarrito(ids.join(","))).toBeNull();
  });
});

describe("getProductosCarrito", () => {
  it("pide solo productos activos de entre los ids, con su stock", async () => {
    prisma.producto.findMany.mockResolvedValue([]);

    await getProductosCarrito([1, 3]);

    expect(prisma.producto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: [1, 3] }, activo: true },
        select: expect.objectContaining({
          precioCentimos: true,
          stock: true,
        }),
      }),
    );
  });

  it("no consulta la base de datos sin ids", async () => {
    expect(await getProductosCarrito([])).toEqual([]);
    expect(prisma.producto.findMany).not.toHaveBeenCalled();
  });
});
