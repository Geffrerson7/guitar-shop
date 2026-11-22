import { describe, expect, it } from "vitest";
import {
  CARRITO_VACIO,
  contarUnidades,
  MAX_LINEAS,
  MAX_POR_LINEA,
  reducirCarrito,
  type Carrito,
} from "./reducer";

const conUna: Carrito = [{ productoId: 3, cantidad: 1 }];

describe("reducirCarrito — agregar", () => {
  it("añade una línea nueva con una unidad", () => {
    expect(
      reducirCarrito(CARRITO_VACIO, { tipo: "agregar", productoId: 3 }),
    ).toEqual([{ productoId: 3, cantidad: 1 }]);
  });

  it("suma a la línea existente sin duplicarla", () => {
    expect(
      reducirCarrito(conUna, { tipo: "agregar", productoId: 3, cantidad: 2 }),
    ).toEqual([{ productoId: 3, cantidad: 3 }]);
  });

  it("no supera el máximo (stock) y devuelve el mismo carrito si ya está lleno", () => {
    const lleno = reducirCarrito(conUna, {
      tipo: "agregar",
      productoId: 3,
      cantidad: 5,
      maximo: 2,
    });
    expect(lleno).toEqual([{ productoId: 3, cantidad: 2 }]);
    expect(
      reducirCarrito(lleno, { tipo: "agregar", productoId: 3, maximo: 2 }),
    ).toBe(lleno);
  });

  it("no añade un producto sin stock", () => {
    expect(
      reducirCarrito(CARRITO_VACIO, {
        tipo: "agregar",
        productoId: 3,
        maximo: 0,
      }),
    ).toBe(CARRITO_VACIO);
  });

  it("respeta el tope absoluto por línea", () => {
    const carrito = reducirCarrito(CARRITO_VACIO, {
      tipo: "agregar",
      productoId: 1,
      cantidad: 500,
    });
    expect(carrito[0]?.cantidad).toBe(MAX_POR_LINEA);
  });

  it.each([0, -1, 1.5, Number.NaN, 2 ** 53])(
    "ignora un id inválido (%s)",
    (productoId) => {
      expect(reducirCarrito(conUna, { tipo: "agregar", productoId })).toBe(
        conUna,
      );
    },
  );

  it.each([0, -2, 1.5])("ignora una cantidad inválida (%s)", (cantidad) => {
    expect(
      reducirCarrito(conUna, { tipo: "agregar", productoId: 3, cantidad }),
    ).toBe(conUna);
  });

  it("no pasa de MAX_LINEAS productos distintos", () => {
    let carrito: Carrito = CARRITO_VACIO;
    for (let id = 1; id <= MAX_LINEAS + 5; id++) {
      carrito = reducirCarrito(carrito, { tipo: "agregar", productoId: id });
    }
    expect(carrito).toHaveLength(MAX_LINEAS);
  });
});

describe("reducirCarrito — cambiarCantidad", () => {
  it("fija la cantidad", () => {
    expect(
      reducirCarrito(conUna, {
        tipo: "cambiarCantidad",
        productoId: 3,
        cantidad: 2,
      }),
    ).toEqual([{ productoId: 3, cantidad: 2 }]);
  });

  it("acota al máximo y no baja de 1", () => {
    expect(
      reducirCarrito(conUna, {
        tipo: "cambiarCantidad",
        productoId: 3,
        cantidad: 9,
        maximo: 2,
      }),
    ).toEqual([{ productoId: 3, cantidad: 2 }]);

    const dos: Carrito = [{ productoId: 3, cantidad: 2 }];
    expect(
      reducirCarrito(dos, {
        tipo: "cambiarCantidad",
        productoId: 3,
        cantidad: 0,
      }),
    ).toEqual([{ productoId: 3, cantidad: 1 }]);
  });

  it("no hace nada si el producto no está o la cantidad no es entera", () => {
    expect(
      reducirCarrito(conUna, {
        tipo: "cambiarCantidad",
        productoId: 9,
        cantidad: 2,
      }),
    ).toBe(conUna);
    expect(
      reducirCarrito(conUna, {
        tipo: "cambiarCantidad",
        productoId: 3,
        cantidad: 1.5,
      }),
    ).toBe(conUna);
  });
});

describe("reducirCarrito — quitar y vaciar", () => {
  const dos: Carrito = [
    { productoId: 3, cantidad: 1 },
    { productoId: 5, cantidad: 2 },
  ];

  it("quita solo la línea indicada", () => {
    expect(reducirCarrito(dos, { tipo: "quitar", productoId: 3 })).toEqual([
      { productoId: 5, cantidad: 2 },
    ]);
  });

  it("quitar un producto ausente devuelve el mismo carrito", () => {
    expect(reducirCarrito(dos, { tipo: "quitar", productoId: 9 })).toBe(dos);
  });

  it("vacía el carrito", () => {
    expect(reducirCarrito(dos, { tipo: "vaciar" })).toEqual([]);
    expect(reducirCarrito(CARRITO_VACIO, { tipo: "vaciar" })).toBe(
      CARRITO_VACIO,
    );
  });

  it("no muta el carrito de entrada", () => {
    const copia = structuredClone(dos);
    reducirCarrito(dos, { tipo: "agregar", productoId: 3 });
    reducirCarrito(dos, { tipo: "quitar", productoId: 5 });
    expect(dos).toEqual(copia);
  });
});

it("contarUnidades suma las cantidades", () => {
  expect(
    contarUnidades([
      { productoId: 1, cantidad: 2 },
      { productoId: 2, cantidad: 3 },
    ]),
  ).toBe(5);
});
