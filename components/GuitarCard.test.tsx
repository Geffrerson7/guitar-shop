import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Guitarra } from "@/types/guitarra";
import GuitarCard from "./GuitarCard";

const guitarra: Guitarra = {
  id: 7,
  nombre: "Masterbuilt '57 S-Type",
  marca: "Fender Custom Shop",
  precio: 6100,
  categoria: "Eléctricas",
  badge: "Vintage",
  imagen: "/assets/masterbuilt.webp",
  descripcion: "Reissue envejecido a mano.",
  specs: [],
};

describe("GuitarCard", () => {
  it("el enlace al detalle se llama como el producto", () => {
    render(<GuitarCard guitarra={guitarra} />);

    expect(
      screen.getByRole("link", { name: "Masterbuilt '57 S-Type" }),
    ).toHaveAttribute("href", "/producto/7");
    expect(
      screen.getByRole("heading", { level: 2, name: "Masterbuilt '57 S-Type" }),
    ).toBeInTheDocument();
  });

  it("muestra marca, precio, índice y badge", () => {
    render(<GuitarCard guitarra={guitarra} index={6} />);

    const tarjeta = screen.getByRole("article");
    expect(tarjeta).toHaveTextContent("Fender Custom Shop");
    expect(tarjeta).toHaveTextContent(/6100\s€/);
    expect(tarjeta).toHaveTextContent("07");
    expect(tarjeta).toHaveTextContent("Vintage");
  });

  it("el índice y «Ver pieza» son decorativos para tecnologías de apoyo", () => {
    render(<GuitarCard guitarra={guitarra} index={6} />);

    expect(screen.getByText("07")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Ver pieza →")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("la imagen tiene un texto alternativo descriptivo y carga diferida", () => {
    render(<GuitarCard guitarra={guitarra} />);

    const imagen = screen.getByRole("img", {
      name: "Masterbuilt '57 S-Type — Fender Custom Shop",
    });
    expect(imagen).toHaveAttribute("loading", "lazy");
  });

  it("como imagen LCP carga de inmediato y con prioridad alta", () => {
    render(<GuitarCard guitarra={guitarra} lcp />);

    const imagen = screen.getByRole("img");
    expect(imagen).toHaveAttribute("loading", "eager");
    expect(imagen).toHaveAttribute("fetchpriority", "high");
  });

  it("sin badge no muestra la etiqueta", () => {
    render(<GuitarCard guitarra={{ ...guitarra, badge: null }} />);
    expect(screen.getByRole("article")).not.toHaveTextContent("Vintage");
  });
});
