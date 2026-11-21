import { describe, expect, it } from "vitest";
import {
  hayFiltrosActivos,
  hrefCatalogo,
  hrefDesdeFormulario,
} from "./catalogo-url";

describe("hrefCatalogo", () => {
  it("omite los valores por defecto", () => {
    expect(hrefCatalogo({ orden: "destacados", pagina: 1 })).toBe("/catalogo");
  });

  it("conserva los filtros y aplica los cambios", () => {
    expect(
      hrefCatalogo(
        { q: "les paul", marca: "Gibson", orden: "nombre", pagina: 1 },
        { pagina: 3 },
      ),
    ).toBe("/catalogo?q=les+paul&marca=Gibson&orden=nombre&pagina=3");
  });

  it("incluye un precio mínimo de 0", () => {
    expect(hrefCatalogo({ precioMin: 0, orden: "destacados", pagina: 1 })).toBe(
      "/catalogo?precioMin=0",
    );
  });

  it("codifica caracteres especiales", () => {
    expect(hrefCatalogo({ marca: "D'Angelico & Co" })).toBe(
      "/catalogo?marca=D%27Angelico+%26+Co",
    );
  });
});

describe("hrefDesdeFormulario", () => {
  it("descarta vacíos, el orden por defecto y la página", () => {
    expect(
      hrefDesdeFormulario([
        ["q", " gibson "],
        ["categoria", ""],
        ["precioMax", "5000"],
        ["orden", "destacados"],
        ["pagina", "4"],
      ]),
    ).toBe("/catalogo?q=gibson&precioMax=5000");
  });

  it("sin datos lleva al catálogo completo", () => {
    expect(hrefDesdeFormulario([])).toBe("/catalogo");
  });
});

describe("hayFiltrosActivos", () => {
  it("el orden y la página no son filtros", () => {
    expect(hayFiltrosActivos({ orden: "precio-asc", pagina: 3 })).toBe(false);
  });

  it("un precio mínimo de 0 sí es un filtro", () => {
    expect(
      hayFiltrosActivos({ precioMin: 0, orden: "destacados", pagina: 1 }),
    ).toBe(true);
  });
});
