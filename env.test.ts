// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

// `env.ts` valida `process.env` al importarse; se le da un entorno válido
// antes de cargarlo y luego se prueba `parseEnv` con entornos concretos.
vi.stubEnv("DATABASE_URL", "postgresql://u:p@localhost:5432/db");
const { parseEnv } = await import("./env");

const valido = { DATABASE_URL: "postgresql://u:p@localhost:5432/db" };

describe("parseEnv", () => {
  it("acepta un entorno mínimo válido", () => {
    expect(parseEnv(valido)).toEqual(valido);
  });

  it("acepta las cadenas agrupada y directa de Neon", () => {
    const env = parseEnv({
      DATABASE_URL:
        "postgresql://u:p@ep-x-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require",
      DIRECT_URL:
        "postgres://u:p@ep-x.eu-central-1.aws.neon.tech/neondb?sslmode=require",
      SITE_URL: "https://voltioymadera.es",
    });
    expect(env.DIRECT_URL).toContain("ep-x.eu-central-1");
  });

  it("falla con un mensaje claro si falta DATABASE_URL", () => {
    expect(() => parseEnv({})).toThrow(
      /DATABASE_URL: es obligatoria y no está definida/,
    );
    expect(() => parseEnv({})).toThrow(/\.env\.example/);
  });

  it("trata una variable vacía como ausente", () => {
    expect(() => parseEnv({ DATABASE_URL: "" })).toThrow(/DATABASE_URL/);
    expect(parseEnv({ ...valido, SITE_URL: "" }).SITE_URL).toBeUndefined();
  });

  it("rechaza URLs que no son de PostgreSQL", () => {
    expect(() =>
      parseEnv({ DATABASE_URL: "mysql://u:p@localhost:3306/db" }),
    ).toThrow(/DATABASE_URL/);
    expect(() => parseEnv({ ...valido, SITE_URL: "ftp://x.es" })).toThrow(
      /SITE_URL/,
    );
  });
});
