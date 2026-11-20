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
  it("enlaza al detalle con nombre, marca, precio e índice", () => {
    render(<GuitarCard guitarra={guitarra} index={6} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/producto/7");
    expect(
      screen.getByRole("heading", { name: "Masterbuilt '57 S-Type" }),
    ).toBeInTheDocument();
    expect(link).toHaveTextContent("Fender Custom Shop");
    expect(link).toHaveTextContent(/6100\s€/);
    expect(link).toHaveTextContent("07");
    expect(link).toHaveTextContent("Vintage");
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
    expect(screen.getByRole("link")).not.toHaveTextContent("Vintage");
  });
});
