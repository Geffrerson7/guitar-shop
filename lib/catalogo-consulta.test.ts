import { describe, expect, it } from "vitest";
import {
  construirOrden,
  construirWhere,
  escaparLike,
  paginar,
  terminosBusqueda,
} from "./catalogo-consulta";
import type { FiltrosCatalogo } from "./catalogo-url";

const base: FiltrosCatalogo = { orden: "destacados", pagina: 1 };

describe("construirWhere", () => {
  it("siempre limita a productos activos", () => {
    expect(construirWhere(base)).toEqual({ activo: true });
  });

  it("combina categoría, marca y rango de precio en céntimos", () => {
    expect(
      construirWhere({
        ...base,
        categoria: "electricas",
        marca: "Gibson",
        precioMin: 1000,
        precioMax: 6000,
      }),
    ).toEqual({
      activo: true,
      categoria: { slug: "electricas" },
      marca: "Gibson",
      precioCentimos: { gte: 100_000, lte: 600_000 },
    });
  });

  it("admite solo uno de los extremos del rango", () => {
    expect(construirWhere({ ...base, precioMax: 500 }).precioCentimos).toEqual({
      lte: 50_000,
    });
    expect(construirWhere({ ...base, precioMin: 0 }).precioCentimos).toEqual({
      gte: 0,
    });
  });

  it("restringe a los ids de la búsqueda, también si no hay ninguno", () => {
    expect(construirWhere(base, [2, 4]).id).toEqual({ in: [2, 4] });
    expect(construirWhere(base, []).id).toEqual({ in: [] });
  });
});

describe("construirOrden", () => {
  it.each([
    ["destacados", [{ id: "asc" }]],
    ["precio-asc", [{ precioCentimos: "asc" }, { id: "asc" }]],
    ["precio-desc", [{ precioCentimos: "desc" }, { id: "asc" }]],
    ["nombre", [{ nombre: "asc" }, { id: "asc" }]],
    ["novedad", [{ creadoEn: "desc" }, { id: "desc" }]],
  ] as const)("%s termina con un desempate determinista", (orden, esperado) => {
    expect(construirOrden(orden)).toEqual(esperado);
  });
});

describe("paginar", () => {
  it("calcula páginas y desplazamiento", () => {
    expect(paginar(2, 12, 8)).toEqual({ pagina: 2, totalPaginas: 2, skip: 8 });
  });

  it("acota una página fuera de rango a la última", () => {
    expect(paginar(99, 12, 8)).toEqual({ pagina: 2, totalPaginas: 2, skip: 8 });
  });

  it("sin resultados hay una única página vacía", () => {
    expect(paginar(3, 0, 8)).toEqual({ pagina: 1, totalPaginas: 1, skip: 0 });
  });
});

describe("búsqueda de texto", () => {
  it("separa en palabras y limita a 5", () => {
    expect(terminosBusqueda("  les   paul  ")).toEqual(["les", "paul"]);
    expect(terminosBusqueda("a b c d e f g")).toHaveLength(5);
  });

  it("escapa los comodines de LIKE", () => {
    expect(escaparLike("100%_\\")).toBe("100\\%\\_\\\\");
  });
});
