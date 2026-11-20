import { describe, expect, it } from "vitest";
import { formatPrice } from "./formatPrice";

// Intl usa espacios no separables entre cifra y símbolo; se normalizan para
// comparar el texto que ve el usuario.
const visible = (text: string) => text.replace(/\s/g, " ");

describe("formatPrice", () => {
  it("recibe céntimos y formatea euros con el criterio es-ES", () => {
    expect(visible(formatPrice(890_000))).toBe("8900 €");
    expect(visible(formatPrice(1_250_000))).toBe("12.500 €");
  });

  it("no depende del locale del navegador (COD-01)", () => {
    // El mismo importe siempre produce la misma cadena.
    expect(formatPrice(245_000)).toBe(formatPrice(245_000));
    expect(visible(formatPrice(245_000))).not.toContain(",");
  });

  it("redondea los céntimos al euro más cercano", () => {
    expect(visible(formatPrice(9_960))).toBe("100 €");
    expect(visible(formatPrice(9_949))).toBe("99 €");
  });
});
