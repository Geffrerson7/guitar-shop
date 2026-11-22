// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { DatosCheckout } from "./validaciones/checkout";

/*
 * Integración de la transacción de pedidos (Fase 11) contra PostgreSQL real.
 * Cada prueba trabaja con productos propios (sufijo único) que se crean antes
 * y se borran al final junto con sus pedidos: el seed no se toca. Se omiten
 * si no hay DATABASE_URL.
 */

const hayBaseDeDatos = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hayBaseDeDatos)("pedidos contra PostgreSQL", () => {
  const sufijo = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let pedidos: typeof import("./pedidos");
  let prisma: (typeof import("./prisma"))["prisma"];
  let n = 0;

  async function producto(stock: number, cambios: { activo?: boolean } = {}) {
    n += 1;
    return prisma.producto.create({
      data: {
        slug: `pedido-${n}-${sufijo}`,
        nombre: `Pieza de prueba ${n}`,
        marca: "Pruebas",
        descripcion: "Producto de prueba de pedidos.",
        precioCentimos: 125_000,
        imagen: "/guitarras/om-series-artisan.webp",
        specs: [],
        stock,
        categoria: { connect: { slug: "accesorios" } },
        ...cambios,
      },
    });
  }

  function datos(
    lineas: DatosCheckout["lineas"],
    clave: string = randomUUID(),
  ): DatosCheckout {
    return {
      contacto: {
        nombre: "Ana López",
        email: `ana+${sufijo}@example.com`,
        direccion: "Calle Mayor 12",
        codigoPostal: "28013",
        localidad: "Madrid",
        provincia: "Madrid",
      },
      lineas: [...lineas].sort((a, b) => a.productoId - b.productoId),
      claveIdempotencia: clave,
    };
  }

  async function stockDe(id: number) {
    return (await prisma.producto.findUniqueOrThrow({ where: { id } })).stock;
  }

  async function pedidosDePrueba() {
    return prisma.pedido.count({
      where: { email: `ana+${sufijo}@example.com` },
    });
  }

  beforeAll(async () => {
    pedidos = await import("./pedidos");
    ({ prisma } = await import("./prisma"));
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.pedido.deleteMany({
      where: { email: `ana+${sufijo}@example.com` },
    });
    await prisma.producto.deleteMany({ where: { slug: { endsWith: sufijo } } });
    await prisma.$disconnect();
  });

  it("crea el pedido con sus líneas, copia los precios y descuenta el stock", async () => {
    const a = await producto(3);
    const b = await producto(1);

    const resultado = await pedidos.crearPedido(
      datos([
        { productoId: a.id, cantidad: 2 },
        { productoId: b.id, cantidad: 1 },
      ]),
    );

    expect(resultado).toMatchObject({ ok: true, repetido: false });
    if (!resultado.ok) return;
    expect(resultado.productoIds).toEqual([a.id, b.id]);

    const pedido = await prisma.pedido.findUniqueOrThrow({
      where: { codigo: resultado.codigo },
      include: { lineas: { orderBy: { productoId: "asc" } } },
    });
    expect(pedido).toMatchObject({
      estado: "confirmado",
      totalCentimos: 3 * 125_000,
      nombre: "Ana López",
      telefono: null,
    });
    expect(pedido.lineas).toEqual([
      expect.objectContaining({
        productoId: a.id,
        nombre: a.nombre,
        marca: "Pruebas",
        precioUnitarioCentimos: 125_000,
        cantidad: 2,
      }),
      expect.objectContaining({ productoId: b.id, cantidad: 1 }),
    ]);
    expect([await stockDe(a.id), await stockDe(b.id)]).toEqual([1, 0]);
  });

  it("el pedido no cambia si después cambia el producto", async () => {
    const a = await producto(2);
    const resultado = await pedidos.crearPedido(
      datos([{ productoId: a.id, cantidad: 1 }]),
    );
    if (!resultado.ok) throw new Error("debía crearse");

    await prisma.producto.update({
      where: { id: a.id },
      data: { precioCentimos: 1, nombre: "Renombrada" },
    });

    const resumen = await pedidos.getPedidoPorCodigo(resultado.codigo);
    expect(resumen).toMatchObject({
      totalCentimos: 125_000,
      lineas: [{ nombre: a.nombre, precioUnitarioCentimos: 125_000 }],
    });
  });

  it("con stock insuficiente no crea nada ni descuenta ninguna línea", async () => {
    const bien = await producto(5);
    const corta = await producto(1);
    const antes = await pedidosDePrueba();

    const resultado = await pedidos.crearPedido(
      datos([
        { productoId: bien.id, cantidad: 1 },
        { productoId: corta.id, cantidad: 2 },
      ]),
    );

    expect(resultado).toEqual({
      ok: false,
      problemas: [
        {
          productoId: corta.id,
          nombre: corta.nombre,
          motivo: "stock-insuficiente",
          disponibles: 1,
        },
      ],
    });
    expect(await pedidosDePrueba()).toBe(antes);
    expect([await stockDe(bien.id), await stockDe(corta.id)]).toEqual([5, 1]);
  });

  it("rechaza un producto inactivo o inexistente", async () => {
    const inactivo = await producto(4, { activo: false });

    const resultado = await pedidos.crearPedido(
      datos([
        { productoId: inactivo.id, cantidad: 1 },
        { productoId: 2_000_000_000, cantidad: 1 },
      ]),
    );

    expect(resultado).toMatchObject({
      ok: false,
      problemas: [
        { productoId: inactivo.id, motivo: "no-disponible" },
        { productoId: 2_000_000_000, nombre: null, motivo: "no-disponible" },
      ],
    });
    expect(await stockDe(inactivo.id)).toBe(4);
  });

  it("dos pedidos a la vez sobre la última unidad: solo uno se crea", async () => {
    const ultima = await producto(1);
    const antes = await pedidosDePrueba();

    const resultados = await Promise.all([
      pedidos.crearPedido(datos([{ productoId: ultima.id, cantidad: 1 }])),
      pedidos.crearPedido(datos([{ productoId: ultima.id, cantidad: 1 }])),
    ]);

    expect(resultados.filter((r) => r.ok)).toHaveLength(1);
    expect(resultados.find((r) => !r.ok)).toMatchObject({
      problemas: [{ productoId: ultima.id, motivo: "agotado" }],
    });
    expect(await stockDe(ultima.id)).toBe(0);
    expect(await pedidosDePrueba()).toBe(antes + 1);
  });

  it("pedidos cruzados sobre los mismos productos no se interbloquean", async () => {
    const a = await producto(10);
    const b = await producto(10);

    const resultados = await Promise.all(
      Array.from({ length: 6 }, () =>
        pedidos.crearPedido(
          datos([
            { productoId: a.id, cantidad: 1 },
            { productoId: b.id, cantidad: 1 },
          ]),
        ),
      ),
    );

    expect(resultados.every((r) => r.ok)).toBe(true);
    expect([await stockDe(a.id), await stockDe(b.id)]).toEqual([4, 4]);
  });

  it("reenviar con la misma clave devuelve el mismo pedido", async () => {
    const a = await producto(5);
    const clave = randomUUID();
    const antes = await pedidosDePrueba();

    const primero = await pedidos.crearPedido(
      datos([{ productoId: a.id, cantidad: 1 }], clave),
    );
    const segundo = await pedidos.crearPedido(
      datos([{ productoId: a.id, cantidad: 1 }], clave),
    );

    expect(primero).toMatchObject({ ok: true, repetido: false });
    expect(segundo).toMatchObject({ ok: true, repetido: true });
    expect(primero.ok && segundo.ok && segundo.codigo).toBe(
      primero.ok && primero.codigo,
    );
    expect(await stockDe(a.id)).toBe(4);
    expect(await pedidosDePrueba()).toBe(antes + 1);
  });

  it("dos envíos simultáneos con la misma clave crean un solo pedido", async () => {
    const a = await producto(5);
    const clave = randomUUID();
    const antes = await pedidosDePrueba();

    const resultados = await Promise.all(
      Array.from({ length: 3 }, () =>
        pedidos.crearPedido(datos([{ productoId: a.id, cantidad: 1 }], clave)),
      ),
    );

    expect(resultados.every((r) => r.ok)).toBe(true);
    const codigos = new Set(resultados.map((r) => r.ok && r.codigo));
    expect(codigos.size).toBe(1);
    expect(await stockDe(a.id)).toBe(4);
    expect(await pedidosDePrueba()).toBe(antes + 1);
  });

  it("la base de datos impide un stock negativo", async () => {
    const a = await producto(0);
    await expect(
      prisma.producto.update({
        where: { id: a.id },
        data: { stock: { decrement: 1 } },
      }),
    ).rejects.toThrow();
  });

  it("getPedidoPorCodigo ignora códigos mal formados o inexistentes", async () => {
    expect(await pedidos.getPedidoPorCodigo("1")).toBeNull();
    expect(
      await pedidos.getPedidoPorCodigo("VM-0000-0000-0000-0000"),
    ).toBeNull();
  });
});
