import { describe, expect, it } from "vitest";
import { calcularCarrito, type ProductoCarrito } from "./calculo";

function producto(
  id: number,
  precioCentimos: number,
  stock: number,
): ProductoCarrito {
  return {
    id,
    nombre: `Pieza ${id}`,
    marca: "Taller",
    precioCentimos,
    imagen: `/guitarras/${id}.webp`,
    stock,
  };
}

describe("calcularCarrito", () => {
  it("calcula subtotales y total con los precios del servidor", () => {
    const resultado = calcularCarrito(
      [
        { productoId: 1, cantidad: 2 },
        { productoId: 2, cantidad: 1 },
      ],
      new Map([
        [1, producto(1, 10_000, 5)],
        [2, producto(2, 2_550, 5)],
      ]),
    );

    expect(resultado.lineas.map((l) => l.subtotalCentimos)).toEqual([
      20_000, 2_550,
    ]);
    expect(resultado.totalCentimos).toBe(22_550);
    expect(resultado.unidades).toBe(3);
    expect(resultado.cargando).toBe(false);
  });

  it("cuenta solo las unidades en stock y lo señala", () => {
    const { lineas, totalCentimos } = calcularCarrito(
      [{ productoId: 1, cantidad: 4 }],
      new Map([[1, producto(1, 10_000, 2)]]),
    );
    expect(lineas[0]).toMatchObject({
      estado: "stock-insuficiente",
      cantidad: 4,
      cantidadFacturable: 2,
    });
    expect(totalCentimos).toBe(20_000);
  });

  it("los agotados y no disponibles no bloquean ni suman", () => {
    const { lineas, totalCentimos, unidades } = calcularCarrito(
      [
        { productoId: 1, cantidad: 1 },
        { productoId: 2, cantidad: 1 },
        { productoId: 3, cantidad: 2 },
      ],
      new Map([
        [1, producto(1, 10_000, 0)],
        [2, null],
        [3, producto(3, 1_000, 9)],
      ]),
    );
    expect(lineas.map((l) => l.estado)).toEqual([
      "agotado",
      "no-disponible",
      "disponible",
    ]);
    expect(totalCentimos).toBe(2_000);
    expect(unidades).toBe(2);
  });

  it("marca como cargando lo que aún no ha respondido el servidor", () => {
    const resultado = calcularCarrito(
      [{ productoId: 1, cantidad: 1 }],
      new Map(),
    );
    expect(resultado.cargando).toBe(true);
    expect(resultado.lineas[0]?.estado).toBe("cargando");
    expect(resultado.totalCentimos).toBe(0);
  });
});
