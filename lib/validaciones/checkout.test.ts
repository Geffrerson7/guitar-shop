// @vitest-environment node
import { describe, expect, it } from "vitest";
import { MAX_LINEAS } from "@/features/carrito/reducer";
import { validarCheckout } from "./checkout";

const CLAVE = "8f14e45f-ceea-4e7a-9b1c-1a2b3c4d5e6f";

function valido(cambios: Record<string, unknown> = {}) {
  return {
    nombre: "  Ana   López  ",
    email: " Ana.Lopez@Example.ES ",
    telefono: "",
    direccion: "Calle Mayor 12, 3.º B",
    codigoPostal: "28013",
    localidad: "Madrid",
    provincia: "Madrid",
    consentimiento: "on",
    lineas: JSON.stringify([
      { productoId: 3, cantidad: 1 },
      { productoId: 1, cantidad: 2 },
    ]),
    claveIdempotencia: CLAVE,
    ...cambios,
  };
}

function errores(cambios: Record<string, unknown>) {
  const resultado = validarCheckout(valido(cambios));
  if (resultado.ok || !("errores" in resultado)) {
    throw new Error("Se esperaban errores de campo");
  }
  return resultado.errores;
}

describe("validarCheckout", () => {
  it("acepta un pedido válido y normaliza los textos", () => {
    const resultado = validarCheckout(valido());

    expect(resultado).toEqual({
      ok: true,
      datos: {
        contacto: {
          nombre: "Ana López",
          email: "ana.lopez@example.es",
          telefono: undefined,
          direccion: "Calle Mayor 12, 3.º B",
          codigoPostal: "28013",
          localidad: "Madrid",
          provincia: "Madrid",
        },
        // Ordenadas por id: el orden en que la transacción bloquea las filas.
        lineas: [
          { productoId: 1, cantidad: 2 },
          { productoId: 3, cantidad: 1 },
        ],
        claveIdempotencia: CLAVE,
      },
    });
  });

  it("lee un FormData y se queda con el primer valor de un campo repetido", () => {
    const formulario = new FormData();
    for (const [campo, valor] of Object.entries(valido())) {
      formulario.append(campo, valor as string);
    }
    formulario.append("nombre", "Otro nombre");

    const resultado = validarCheckout(formulario);
    expect(resultado.ok && resultado.datos.contacto.nombre).toBe("Ana López");
  });

  it("descarta los campos que no están en el esquema (importes incluidos)", () => {
    const resultado = validarCheckout(
      valido({
        totalCentimos: "1",
        lineas: JSON.stringify([
          { productoId: 3, cantidad: 1, precioCentimos: 1 },
        ]),
      }),
    );

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.datos).not.toHaveProperty("totalCentimos");
    expect(resultado.datos.lineas).toEqual([{ productoId: 3, cantidad: 1 }]);
  });

  it("acepta un teléfono con espacios y prefijo", () => {
    const resultado = validarCheckout(valido({ telefono: "+34 600 12 34 56" }));
    expect(resultado.ok && resultado.datos.contacto.telefono).toBe(
      "+34600123456",
    );
  });

  it("señala cada campo obligatorio vacío", () => {
    const e = errores({
      nombre: " ",
      email: "",
      direccion: "",
      codigoPostal: "",
      localidad: "",
      provincia: "",
      consentimiento: undefined,
    });

    expect(Object.keys(e).sort()).toEqual(
      [
        "codigoPostal",
        "consentimiento",
        "direccion",
        "email",
        "localidad",
        "nombre",
        "provincia",
      ].sort(),
    );
    expect(e.nombre).toBe("Escribe tu nombre y apellidos.");
    expect(e.consentimiento).toMatch(/consentimiento/);
  });

  it.each([
    ["email", "ana@", /email/],
    ["telefono", "123", /teléfono/],
    ["codigoPostal", "2801", /cinco cifras/],
    ["codigoPostal", "60000", /cinco cifras/],
    ["codigoPostal", "07001", /península/],
    ["codigoPostal", "38001", /península/],
    ["nombre", "x".repeat(101), /hasta 100/],
    ["consentimiento", "off", /consentimiento/],
  ])("rechaza %s = %j", (campo, valor, mensaje) => {
    expect(errores({ [campo]: valor })[campo as "email"]).toMatch(mensaje);
  });

  it("da un solo mensaje por campo", () => {
    const e = errores({ codigoPostal: "abc" });
    expect(typeof e.codigoPostal).toBe("string");
  });

  it.each([
    ["JSON corrupto", "{no"],
    ["carrito vacío", "[]"],
    ["cantidad 0", JSON.stringify([{ productoId: 1, cantidad: 0 }])],
    ["cantidad decimal", JSON.stringify([{ productoId: 1, cantidad: 1.5 }])],
    ["cantidad enorme", JSON.stringify([{ productoId: 1, cantidad: 100 }])],
    ["id negativo", JSON.stringify([{ productoId: -1, cantidad: 1 }])],
    ["id como texto", JSON.stringify([{ productoId: "1", cantidad: 1 }])],
    [
      "id repetido",
      JSON.stringify([
        { productoId: 1, cantidad: 1 },
        { productoId: 1, cantidad: 1 },
      ]),
    ],
    [
      "demasiadas líneas",
      JSON.stringify(
        Array.from({ length: MAX_LINEAS + 1 }, (_, i) => ({
          productoId: i + 1,
          cantidad: 1,
        })),
      ),
    ],
  ])("rechaza un carrito inválido: %s", (_, lineas) => {
    const resultado = validarCheckout(valido({ lineas }));
    expect(resultado).toEqual({ ok: false, mensaje: expect.any(String) });
  });

  it("rechaza una clave de idempotencia que no es un UUID", () => {
    const resultado = validarCheckout(valido({ claveIdempotencia: "1" }));
    expect(resultado).toEqual({ ok: false, mensaje: expect.any(String) });
  });
});
