import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "./site";

describe("resolveSiteUrl", () => {
  it("usa SITE_URL cuando está definida", () => {
    const url = resolveSiteUrl({
      SITE_URL: "https://voltioymadera.es",
      VERCEL_PROJECT_PRODUCTION_URL: "guitar-shop.vercel.app",
    });
    expect(url.href).toBe("https://voltioymadera.es/");
  });

  it("recurre al dominio de producción de Vercel con https", () => {
    const url = resolveSiteUrl({
      VERCEL_PROJECT_PRODUCTION_URL: "guitar-shop.vercel.app",
    });
    expect(url.href).toBe("https://guitar-shop.vercel.app/");
  });

  it("cae en localhost sin variables", () => {
    expect(resolveSiteUrl({}).href).toBe("http://localhost:3000/");
  });

  it("rechaza una SITE_URL mal formada en lugar de generar URLs rotas", () => {
    expect(() => resolveSiteUrl({ SITE_URL: "voltioymadera" })).toThrow();
  });
});
