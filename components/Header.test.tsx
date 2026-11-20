import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "./Header";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

function enlace(nombre: string) {
  return screen.getByRole("link", { name: nombre });
}

describe("Header", () => {
  beforeEach(() => {
    navigation.pathname = "/";
  });

  it("expone una navegación principal etiquetada y la marca enlazada al inicio", () => {
    render(<Header />);

    expect(
      screen.getByRole("navigation", { name: "Navegación principal" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^Voltio & Madera.*Inicio$/ }),
    ).toHaveAttribute("href", "/");
  });

  it("marca con aria-current solo la ruta exacta", () => {
    navigation.pathname = "/catalogo";
    render(<Header />);

    expect(enlace("Catálogo")).toHaveAttribute("aria-current", "page");
    expect(enlace("Inicio")).not.toHaveAttribute("aria-current");
  });

  it("Inicio no queda activo en otras rutas", () => {
    navigation.pathname = "/contacto";
    render(<Header />);

    expect(enlace("Inicio")).not.toHaveAttribute("aria-current");
    expect(enlace("Contacto")).toHaveAttribute("aria-current", "page");
  });

  it("en el detalle de producto resalta Catálogo sin declarar la página actual", () => {
    navigation.pathname = "/producto/3";
    render(<Header />);

    const catalogo = enlace("Catálogo");
    expect(catalogo).not.toHaveAttribute("aria-current");
    expect(catalogo).toHaveClass("text-ink");
    expect(catalogo).not.toHaveClass("text-ink-soft");
  });
});
