import { describe, expect, it } from "vitest";
import {
  leerCarrito,
  sanearCarrito,
  serializarCarrito,
  VERSION_CARRITO,
} from "./almacenamiento";
import { MAX_LINEAS, MAX_POR_LINEA } from "./reducer";

const v = VERSION_CARRITO;

describe("leerCarrito", () => {
  it("lee lo que escribe serializarCarrito", () => {
    const carrito = [
      { productoId: 3, cantidad: 2 },
      { productoId: 7, cantidad: 1 },
    ];
    expect(leerCarrito(serializarCarrito(carrito))).toEqual(carrito);
  });

  it.each([null, "", "{", "no es json", "null", "42", '"texto"', "[]"])(
    "devuelve un carrito vacío ante un valor ausente o corrupto (%s)",
    (texto) => {
      expect(leerCarrito(texto)).toEqual([]);
    },
  );
});

describe("sanearCarrito", () => {
  it("descarta una versión antigua o futura", () => {
    const lineas = [{ productoId: 3, cantidad: 1 }];
    expect(sanearCarrito({ v: 0, lineas })).toEqual([]);
    expect(sanearCarrito({ v: v + 1, lineas })).toEqual([]);
    expect(sanearCarrito({ lineas })).toEqual([]);
    // Un formato anterior sin envoltorio ni versión.
    expect(sanearCarrito(lineas)).toEqual([]);
  });

  it("descarta líneas con id o cantidad inválidos y conserva las buenas", () => {
    expect(
      sanearCarrito({
        v,
        lineas: [
          { productoId: 3, cantidad: 1 },
          { productoId: "3", cantidad: 1 },
          { productoId: -1, cantidad: 1 },
          { productoId: 1.5, cantidad: 1 },
          { productoId: 4, cantidad: 0 },
          { productoId: 5, cantidad: "2" },
          { productoId: 6, cantidad: Number.POSITIVE_INFINITY },
          null,
          "basura",
          { productoId: 8, cantidad: 2 },
        ],
      }),
    ).toEqual([
      { productoId: 3, cantidad: 1 },
      { productoId: 8, cantidad: 2 },
    ]);
  });

  it("ignora campos inyectados como el precio", () => {
    expect(
      sanearCarrito({
        v,
        lineas: [
          { productoId: 3, cantidad: 1, precioCentimos: 1, nombre: "Gratis" },
        ],
      }),
    ).toEqual([{ productoId: 3, cantidad: 1 }]);
  });

  it("fusiona ids repetidos con el tope por línea", () => {
    expect(
      sanearCarrito({
        v,
        lineas: [
          { productoId: 3, cantidad: 2 },
          { productoId: 3, cantidad: 3 },
          { productoId: 4, cantidad: 90 },
          { productoId: 4, cantidad: 90 },
        ],
      }),
    ).toEqual([
      { productoId: 3, cantidad: 5 },
      { productoId: 4, cantidad: MAX_POR_LINEA },
    ]);
  });

  it("acota el número de líneas", () => {
    const lineas = Array.from({ length: MAX_LINEAS + 20 }, (_, i) => ({
      productoId: i + 1,
      cantidad: 1,
    }));
    expect(sanearCarrito({ v, lineas })).toHaveLength(MAX_LINEAS);
  });
});

it("serializarCarrito devuelve null para un carrito vacío", () => {
  expect(serializarCarrito([])).toBeNull();
});
