import { describe, expect, it } from "vitest";
import { getCategorias, getGuitarraById, getGuitarras } from "./guitarras";

describe("capa de datos de guitarras", () => {
  it("devuelve las 12 piezas del catálogo con ids únicos", async () => {
    const guitarras = await getGuitarras();

    expect(guitarras).toHaveLength(12);
    expect(new Set(guitarras.map((g) => g.id)).size).toBe(12);
  });

  it("cada pieza tiene los datos que necesita la interfaz", async () => {
    for (const guitarra of await getGuitarras()) {
      expect(guitarra.nombre).not.toBe("");
      expect(guitarra.marca).not.toBe("");
      expect(guitarra.precio).toBeGreaterThan(0);
      expect(Number.isInteger(guitarra.precio)).toBe(true);
      expect(guitarra.imagen).toBeTruthy();
    }
  });

  it("encuentra una pieza por id", async () => {
    const guitarra = await getGuitarraById(3);
    expect(guitarra?.nombre).toBe("OM-Series Artisan");
  });

  it("devuelve null para un id inexistente", async () => {
    expect(await getGuitarraById(999)).toBeNull();
  });

  it("lista las categorías sin repetir", async () => {
    const categorias = await getCategorias();

    expect(new Set(categorias).size).toBe(categorias.length);
    expect(categorias).toEqual(
      expect.arrayContaining(["Eléctricas", "Acústicas", "Bajos"]),
    );
  });
});
