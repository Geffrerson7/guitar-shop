import { describe, expect, it } from "vitest";
import type { Guitarra } from "@/types/guitarra";
import { productJsonLd, serializeJsonLd } from "./structured-data";

const guitarra: Guitarra = {
  id: 3,
  nombre: "OM-Series Artisan",
  marca: "Voltio & Madera",
  precio: 3100,
  categoria: "Acústicas",
  badge: null,
  imagen: "/_next/static/media/om-series-artisan.webp",
  descripcion: "Acústica artesanal.",
  specs: [],
};

describe("productJsonLd", () => {
  it("describe el producto con schema.org y URLs absolutas", () => {
    const data = productJsonLd(guitarra);

    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "OM-Series Artisan",
      sku: "3",
      brand: { "@type": "Brand", name: "Voltio & Madera" },
    });
    expect(data.url).toMatch(/^https?:\/\/.+\/producto\/3$/);
    expect(data.image[0]).toMatch(/^https?:\/\/.+om-series-artisan\.webp$/);
  });

  it("publica el precio en euros y sin venta online", () => {
    expect(productJsonLd(guitarra).offers).toMatchObject({
      price: "3100.00",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStoreOnly",
    });
  });

  it("acepta una imagen como import estático", () => {
    const data = productJsonLd({
      ...guitarra,
      imagen: { src: "/_next/static/media/x.webp", width: 512, height: 512 },
    });
    expect(data.image[0]).toMatch(/\/_next\/static\/media\/x\.webp$/);
  });
});

describe("serializeJsonLd", () => {
  it("escapa < para que un texto no pueda cerrar la etiqueta script", () => {
    const json = serializeJsonLd({
      name: "</script><script>alert(1)</script>",
    });

    expect(json).not.toContain("<");
    expect(JSON.parse(json).name).toBe("</script><script>alert(1)</script>");
  });
});
