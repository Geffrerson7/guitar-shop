// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseFiltrosCatalogo } from "./catalogo";

const porDefecto = { orden: "destacados", pagina: 1 };

describe("parseFiltrosCatalogo", () => {
  it("sin parámetros devuelve el catálogo por defecto", () => {
    expect(parseFiltrosCatalogo({})).toEqual(porDefecto);
  });

  it("acepta una combinación válida completa", () => {
    expect(
      parseFiltrosCatalogo({
        q: "  gibson  ",
        categoria: "electricas",
        marca: "Gibson",
        precioMin: "1000",
        precioMax: "6000",
        orden: "precio-desc",
        pagina: "2",
      }),
    ).toEqual({
      q: "gibson",
      categoria: "electricas",
      marca: "Gibson",
      precioMin: 1000,
      precioMax: 6000,
      orden: "precio-desc",
      pagina: 2,
    });
  });

  it("los campos vacíos del formulario sin JavaScript cuentan como ausentes", () => {
    expect(
      parseFiltrosCatalogo({
        q: "",
        categoria: "",
        marca: "   ",
        precioMin: "",
        precioMax: "",
        orden: "destacados",
      }),
    ).toEqual(porDefecto);
  });

  it.each([
    ["orden desconocido", { orden: "hack" }],
    ["página no numérica", { pagina: "abc" }],
    ["página cero", { pagina: "0" }],
    ["página negativa", { pagina: "-3" }],
    ["página decimal", { pagina: "1.5" }],
    ["categoría con caracteres no permitidos", { categoria: "../admin" }],
    ["precio negativo", { precioMin: "-5" }],
    ["precio no numérico", { precioMax: "mucho" }],
    ["texto demasiado largo", { q: "x".repeat(101) }],
  ])("ignora un valor inválido sin lanzar: %s", (_, params) => {
    expect(() => parseFiltrosCatalogo(params)).not.toThrow();
    expect(parseFiltrosCatalogo(params)).toEqual(porDefecto);
  });

  it("con un parámetro repetido se queda con el primero", () => {
    expect(parseFiltrosCatalogo({ q: ["a", "b"] }).q).toBe("a");
  });

  it("corrige un rango de precio invertido", () => {
    const filtros = parseFiltrosCatalogo({
      precioMin: "4000",
      precioMax: "3000",
    });
    expect([filtros.precioMin, filtros.precioMax]).toEqual([3000, 4000]);
  });

  it("acepta URLSearchParams", () => {
    expect(
      parseFiltrosCatalogo(new URLSearchParams("marca=Warwick&pagina=2")),
    ).toEqual({ marca: "Warwick", orden: "destacados", pagina: 2 });
  });
});
