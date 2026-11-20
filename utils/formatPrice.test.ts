import { describe, expect, it } from "vitest";
import { formatPrice } from "./formatPrice";

// Intl usa espacios no separables entre cifra y símbolo; se normalizan para
// comparar el texto que ve el usuario.
const visible = (text: string) => text.replace(/\s/g, " ");

describe("formatPrice", () => {
  it("formatea euros con el criterio es-ES y sin decimales", () => {
    expect(visible(formatPrice(8900))).toBe("8900 €");
    expect(visible(formatPrice(12500))).toBe("12.500 €");
  });

  it("no depende del locale del navegador (COD-01)", () => {
    // El mismo importe siempre produce la misma cadena.
    expect(formatPrice(2450)).toBe(formatPrice(2450));
    expect(visible(formatPrice(2450))).not.toContain(",");
  });

  it("redondea importes con decimales", () => {
    expect(visible(formatPrice(99.6))).toBe("100 €");
  });
});
