import { describe, expect, it } from "vitest";
import { pageMetadata, shareImage } from "./seo";

describe("pageMetadata", () => {
  it("compone título, canonical, Open Graph y Twitter de una página", () => {
    const metadata = pageMetadata({
      title: "Catálogo",
      description: "Doce instrumentos.",
      path: "/catalogo",
    });

    expect(metadata.title).toBe("Catálogo");
    expect(metadata.description).toBe("Doce instrumentos.");
    expect(metadata.alternates?.canonical).toBe("/catalogo");
    expect(metadata.openGraph).toMatchObject({
      title: "Catálogo — Voltio & Madera",
      url: "/catalogo",
      locale: "es_ES",
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Catálogo — Voltio & Madera",
    });
  });

  it("incluye siempre la imagen para compartir", () => {
    const metadata = pageMetadata({ description: "x", path: "/acerca" });

    expect(metadata.openGraph?.images).toEqual([shareImage]);
    expect(metadata.twitter?.images).toEqual([shareImage]);
  });

  it("sin título deja el del layout y usa el nombre completo en Open Graph", () => {
    const metadata = pageMetadata({ description: "x", path: "/" });

    expect(metadata.title).toBeUndefined();
    expect(metadata.openGraph?.title).toBe(
      "Voltio & Madera — Luthiería de autor en Madrid",
    );
  });
});
