"use client";

import {
  createContext,
  use,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { contarUnidades, type Carrito } from "./reducer";
import { despachar, getServerSnapshot, getSnapshot, suscribir } from "./store";

/*
 * Proveedor del carrito (Fase 10). Expone el estado y las acciones, y es
 * dueño de la región viva que anuncia cada cambio a los lectores de pantalla
 * (una sola para todo el sitio: los componentes no declaran la suya y nada
 * se anuncia dos veces).
 */

/** Lo que el proveedor necesita saber de un producto para anunciarlo. */
export interface ProductoAnunciable {
  id: number;
  nombre: string;
}

export interface ValorCarrito {
  lineas: Carrito;
  /** Unidades totales guardadas. */
  unidades: number;
  /**
   * `false` en el servidor y durante la hidratación: el carrito todavía no se
   * ha leído del navegador y `lineas` está vacío aunque no lo esté.
   */
  hidratado: boolean;
  cantidadDe: (productoId: number) => number;
  agregar: (producto: ProductoAnunciable, maximo: number) => void;
  cambiarCantidad: (
    producto: ProductoAnunciable,
    cantidad: number,
    maximo: number,
  ) => void;
  quitar: (producto: ProductoAnunciable | number) => void;
  vaciar: () => void;
}

const CarritoContext = createContext<ValorCarrito | null>(null);

const sinSuscripcion = () => () => {};

export function textoUnidades(unidades: number): string {
  return `${unidades} ${unidades === 1 ? "artículo" : "artículos"}`;
}

export function CarritoProvider({ children }: { children: ReactNode }) {
  const lineas = useSyncExternalStore(
    suscribir,
    getSnapshot,
    getServerSnapshot,
  );
  const hidratado = useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  );
  // El contador alterna un espacio no separable al final para que dos avisos
  // seguidos con el mismo texto se vuelvan a anunciar.
  const [anuncio, setAnuncio] = useState({ texto: "", n: 0 });

  const valor = useMemo<ValorCarrito>(() => {
    const anunciar = (texto: string) =>
      setAnuncio((previo) => ({ texto, n: previo.n + 1 }));
    const total = (carrito: Carrito) =>
      `${textoUnidades(contarUnidades(carrito))} en el carrito.`;

    return {
      lineas,
      unidades: contarUnidades(lineas),
      hidratado,
      cantidadDe: (productoId) =>
        lineas.find((linea) => linea.productoId === productoId)?.cantidad ?? 0,

      agregar: (producto, maximo) => {
        const antes = getSnapshot();
        const despues = despachar({
          tipo: "agregar",
          productoId: producto.id,
          maximo,
        });
        anunciar(
          despues === antes
            ? `No quedan más unidades de ${producto.nombre}.`
            : `${producto.nombre} añadido al carrito. ${total(despues)}`,
        );
      },

      cambiarCantidad: (producto, cantidad, maximo) => {
        const despues = despachar({
          tipo: "cambiarCantidad",
          productoId: producto.id,
          cantidad,
          maximo,
        });
        const unidades =
          despues.find((linea) => linea.productoId === producto.id)?.cantidad ??
          0;
        anunciar(`${producto.nombre}: ${textoUnidades(unidades)}.`);
      },

      quitar: (producto) => {
        const id = typeof producto === "number" ? producto : producto.id;
        const despues = despachar({ tipo: "quitar", productoId: id });
        const nombre =
          typeof producto === "number" ? "Producto" : producto.nombre;
        anunciar(`${nombre} eliminado del carrito. ${total(despues)}`);
      },

      vaciar: () => {
        despachar({ tipo: "vaciar" });
        anunciar("Carrito vaciado.");
      },
    };
  }, [lineas, hidratado]);

  return (
    <CarritoContext value={valor}>
      {children}
      <p role="status" aria-live="polite" className="sr-only">
        {anuncio.texto}
        {anuncio.n % 2 === 1 ? " " : ""}
      </p>
    </CarritoContext>
  );
}

export function useCarrito(): ValorCarrito {
  const valor = use(CarritoContext);
  if (!valor) {
    throw new Error("useCarrito debe usarse dentro de <CarritoProvider>.");
  }
  return valor;
}
