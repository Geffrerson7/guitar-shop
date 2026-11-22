import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CarritoProvider } from "@/features/carrito/CarritoProvider";
import { getSnapshot, reiniciarParaPruebas } from "@/features/carrito/store";
import AnadirAlCarrito from "./AnadirAlCarrito";

function renderBoton(stock: number) {
  return render(
    <CarritoProvider>
      <AnadirAlCarrito
        productoId={3}
        nombre="OM-Series Artisan"
        stock={stock}
      />
    </CarritoProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  reiniciarParaPruebas();
});

describe("AnadirAlCarrito", () => {
  it("añade una unidad, lo confirma y lo anuncia", () => {
    renderBoton(2);

    fireEvent.click(screen.getByRole("button", { name: "Añadir al carrito" }));

    expect(getSnapshot()).toEqual([{ productoId: 3, cantidad: 1 }]);
    expect(screen.getByText(/En tu carrito: 1 artículo/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver carrito/ })).toHaveAttribute(
      "href",
      "/carrito",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "OM-Series Artisan añadido al carrito. 1 artículo en el carrito.",
    );
  });

  it("no deja superar el stock", () => {
    renderBoton(2);
    const boton = screen.getByRole("button", { name: "Añadir al carrito" });

    fireEvent.click(boton);
    fireEvent.click(boton);

    expect(getSnapshot()).toEqual([{ productoId: 3, cantidad: 2 }]);
    expect(
      screen.getByRole("button", { name: "Ya tienes todas las unidades" }),
    ).toBeDisabled();
  });

  it("un producto agotado no se puede añadir", () => {
    renderBoton(0);
    expect(screen.getByRole("button", { name: "Agotado" })).toBeDisabled();
  });
});
