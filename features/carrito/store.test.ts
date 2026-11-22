import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CLAVE_CARRITO } from "./almacenamiento";
import {
  despachar,
  getServerSnapshot,
  getSnapshot,
  reiniciarParaPruebas,
  suscribir,
} from "./store";

beforeEach(() => {
  localStorage.clear();
  reiniciarParaPruebas();
});

afterEach(() => {
  localStorage.clear();
});

describe("almacén del carrito", () => {
  it("el servidor siempre ve el carrito vacío", () => {
    localStorage.setItem(
      CLAVE_CARRITO,
      JSON.stringify({ v: 1, lineas: [{ productoId: 3, cantidad: 1 }] }),
    );
    expect(getServerSnapshot()).toEqual([]);
    expect(getSnapshot()).toEqual([{ productoId: 3, cantidad: 1 }]);
  });

  it("guarda cada acción en localStorage con el formato versionado", () => {
    despachar({ tipo: "agregar", productoId: 3 });
    expect(JSON.parse(localStorage.getItem(CLAVE_CARRITO) ?? "")).toEqual({
      v: 1,
      lineas: [{ productoId: 3, cantidad: 1 }],
    });

    despachar({ tipo: "vaciar" });
    expect(localStorage.getItem(CLAVE_CARRITO)).toBeNull();
  });

  it("devuelve la misma instantánea mientras no cambie lo guardado", () => {
    despachar({ tipo: "agregar", productoId: 3 });
    expect(getSnapshot()).toBe(getSnapshot());
  });

  it("notifica a los suscriptores solo si algo cambia", () => {
    const oyente = vi.fn();
    const baja = suscribir(oyente);

    despachar({ tipo: "agregar", productoId: 3, maximo: 1 });
    despachar({ tipo: "agregar", productoId: 3, maximo: 1 });
    expect(oyente).toHaveBeenCalledTimes(1);

    baja();
    despachar({ tipo: "quitar", productoId: 3 });
    expect(oyente).toHaveBeenCalledTimes(1);
  });

  it("se sincroniza con los cambios de otra pestaña (evento storage)", () => {
    const oyente = vi.fn();
    const baja = suscribir(oyente);

    const texto = JSON.stringify({
      v: 1,
      lineas: [{ productoId: 5, cantidad: 2 }],
    });
    localStorage.setItem(CLAVE_CARRITO, texto);
    window.dispatchEvent(
      new StorageEvent("storage", { key: CLAVE_CARRITO, newValue: texto }),
    );

    expect(oyente).toHaveBeenCalledTimes(1);
    expect(getSnapshot()).toEqual([{ productoId: 5, cantidad: 2 }]);

    window.dispatchEvent(new StorageEvent("storage", { key: "otra-clave" }));
    expect(oyente).toHaveBeenCalledTimes(1);
    baja();
  });

  it("un contenido corrupto se lee como carrito vacío y se puede seguir usando", () => {
    localStorage.setItem(CLAVE_CARRITO, "{corrupto");
    expect(getSnapshot()).toEqual([]);

    despachar({ tipo: "agregar", productoId: 2 });
    expect(getSnapshot()).toEqual([{ productoId: 2, cantidad: 1 }]);
  });

  it("sigue funcionando en memoria si localStorage falla", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Cuota excedida", "QuotaExceededError");
    });

    despachar({ tipo: "agregar", productoId: 3 });
    despachar({ tipo: "agregar", productoId: 3 });
    expect(getSnapshot()).toEqual([{ productoId: 3, cantidad: 2 }]);
  });
});
