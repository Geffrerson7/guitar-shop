import { describe, expect, it } from "vitest";
import {
  calcularPedido,
  enmascararEmail,
  esCodigoPedido,
  generarCodigoPedido,
  type ProductoPedido,
} from "./pedidos-calculo";

const om: ProductoPedido = {
  id: 3,
  nombre: "OM-Series Artisan",
  marca: "Voltio & Madera",
  precioCentimos: 310_000,
  stock: 2,
  activo: true,
};
const es335: ProductoPedido = {
  id: 2,
  nombre: "1964 Gibson ES-335",
  marca: "Gibson Vintage",
  precioCentimos: 890_000,
  stock: 1,
  activo: true,
};

describe("calcularPedido", () => {
  it("suma las líneas con los precios de la base de datos y los copia", () => {
    const calculo = calcularPedido(
      [
        { productoId: 2, cantidad: 1 },
        { productoId: 3, cantidad: 2 },
      ],
      [om, es335],
    );

    expect(calculo).toEqual({
      ok: true,
      totalCentimos: 890_000 + 2 * 310_000,
      items: [
        {
          productoId: 2,
          nombre: "1964 Gibson ES-335",
          marca: "Gibson Vintage",
          precioUnitarioCentimos: 890_000,
          cantidad: 1,
        },
        {
          productoId: 3,
          nombre: "OM-Series Artisan",
          marca: "Voltio & Madera",
          precioUnitarioCentimos: 310_000,
          cantidad: 2,
        },
      ],
    });
  });

  it("acepta exactamente el stock disponible", () => {
    const calculo = calcularPedido([{ productoId: 3, cantidad: 2 }], [om]);
    expect(calculo.ok).toBe(true);
  });

  it("señala cada línea que falla, no solo la primera", () => {
    const calculo = calcularPedido(
      [
        { productoId: 2, cantidad: 1 },
        { productoId: 3, cantidad: 3 },
        { productoId: 9, cantidad: 1 },
        { productoId: 99, cantidad: 1 },
      ],
      [
        { ...es335, stock: 0 },
        om,
        { ...om, id: 9, nombre: "Retirada", activo: false },
      ],
    );

    expect(calculo).toEqual({
      ok: false,
      problemas: [
        {
          productoId: 2,
          nombre: "1964 Gibson ES-335",
          motivo: "agotado",
          disponibles: 0,
        },
        {
          productoId: 3,
          nombre: "OM-Series Artisan",
          motivo: "stock-insuficiente",
          disponibles: 2,
        },
        {
          productoId: 9,
          nombre: "Retirada",
          motivo: "no-disponible",
          disponibles: 0,
        },
        {
          productoId: 99,
          nombre: null,
          motivo: "no-disponible",
          disponibles: 0,
        },
      ],
    });
  });

  it("trata un stock negativo como agotado", () => {
    const calculo = calcularPedido(
      [{ productoId: 3, cantidad: 1 }],
      [{ ...om, stock: -1 }],
    );
    expect(calculo).toMatchObject({
      ok: false,
      problemas: [{ motivo: "agotado", disponibles: 0 }],
    });
  });
});

describe("código de pedido", () => {
  it("tiene el formato VM-XXXX-XXXX-XXXX-XXXX con el alfabeto de Crockford", () => {
    for (let i = 0; i < 200; i++) {
      const codigo = generarCodigoPedido();
      expect(esCodigoPedido(codigo)).toBe(true);
      expect(codigo).not.toMatch(/[ILOU]/);
    }
  });

  it("no es secuencial ni se repite", () => {
    const codigos = new Set(
      Array.from({ length: 1000 }, () => generarCodigoPedido()),
    );
    expect(codigos.size).toBe(1000);
  });

  it("usa los 5 bits bajos de cada byte aleatorio", () => {
    const codigo = generarCodigoPedido((bytes) => bytes.fill(0xff));
    expect(codigo).toBe("VM-ZZZZ-ZZZZ-ZZZZ-ZZZZ");
  });

  it.each(["", "VM-1234", "vm-abcd-efgh-jkmn-pqrs", "VM-ABCD-EFGH-IJKL-MNOP"])(
    "rechaza un código mal formado (%j)",
    (codigo) => {
      expect(esCodigoPedido(codigo)).toBe(false);
    },
  );
});

describe("enmascararEmail", () => {
  it.each([
    ["ana.lopez@example.com", "an•••@example.com"],
    ["a@example.com", "a•••@example.com"],
    ["sin-arroba", "•••"],
  ])("%s → %s", (email, esperado) => {
    expect(enmascararEmail(email)).toBe(esperado);
  });
});
