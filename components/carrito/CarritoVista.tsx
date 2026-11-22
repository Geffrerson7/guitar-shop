"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ProductImage, { imageSizes } from "@/components/ProductImage";
import { buttonClasses } from "@/components/ui/buttonStyles";
import {
  calcularCarrito,
  type LineaResuelta,
  type ProductoCarrito,
} from "@/features/carrito/calculo";
import { textoUnidades, useCarrito } from "@/features/carrito/CarritoProvider";
import { MAX_POR_LINEA } from "@/features/carrito/reducer";
import { formatPrice } from "@/utils/formatPrice";

/*
 * Contenido de /carrito (Fase 10).
 *
 * El navegador solo aporta ids y cantidades. Los datos de cada producto se
 * piden a `GET /api/carrito` una vez por producto y visita: cambiar una
 * cantidad o quitar una línea no vuelve a la red; un producto nuevo (añadido
 * desde otra pestaña, por ejemplo) sí. Los importes se calculan con los
 * precios de esa respuesta, nunca con nada guardado en el navegador.
 */

type Conocidos = ReadonlyMap<number, ProductoCarrito | null>;

/** Productos del carrito resueltos en el servidor, pidiendo solo los que faltan. */
function useProductosCarrito(ids: readonly number[], activo: boolean) {
  const [conocidos, setConocidos] = useState<Conocidos>(() => new Map());
  const [fallo, setFallo] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  const pendientes = ids.filter((id) => !conocidos.has(id)).join(",");

  useEffect(() => {
    if (!activo || pendientes === "") return;
    const controlador = new AbortController();

    fetch(`/api/carrito?ids=${pendientes}`, {
      signal: controlador.signal,
      cache: "no-store",
    })
      .then(async (respuesta) => {
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        return (await respuesta.json()) as { productos: ProductoCarrito[] };
      })
      .then(({ productos }) => {
        setConocidos((previos) => {
          const siguientes = new Map(previos);
          // Lo pedido que no vuelve no está a la venta.
          for (const id of pendientes.split(",")) siguientes.set(+id, null);
          for (const producto of productos) {
            siguientes.set(producto.id, producto);
          }
          return siguientes;
        });
        setFallo(null);
      })
      .catch(() => {
        if (!controlador.signal.aborted) setFallo(pendientes);
      });

    return () => controlador.abort();
  }, [pendientes, activo, intento]);

  return {
    conocidos,
    error: fallo !== null && fallo === pendientes,
    reintentar: () => setIntento((n) => n + 1),
  };
}

const enlaceProducto =
  "rounded-sm transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

const botonPaso =
  "inline-flex size-11 items-center justify-center rounded-full text-lg text-ink transition-colors hover:bg-paper-deep aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-transparent";

const botonQuitar =
  "rounded-sm text-sm font-medium uppercase tracking-[0.14em] text-ink-soft underline-offset-4 transition-colors hover:text-accent hover:underline";

function Linea({
  linea,
  onQuitar,
}: {
  linea: LineaResuelta;
  onQuitar: (producto: { id: number; nombre: string }) => void;
}) {
  const { cambiarCantidad } = useCarrito();
  const { producto, estado, cantidad } = linea;
  const nombre = producto?.nombre ?? "Producto";
  const anunciable = { id: linea.productoId, nombre };

  if (!producto) {
    return (
      <li className="flex flex-wrap items-center justify-between gap-4 border-b border-line/80 py-6">
        <p className="text-base text-ink-soft">
          {estado === "cargando"
            ? "Cargando pieza…"
            : "Esta pieza ya no está a la venta. No entra en el total."}
        </p>
        <button
          type="button"
          onClick={() => onQuitar(anunciable)}
          aria-label={
            estado === "cargando"
              ? "Eliminar del carrito"
              : "Eliminar pieza no disponible del carrito"
          }
          className={botonQuitar}
        >
          Eliminar
        </button>
      </li>
    );
  }

  const maximo = Math.min(producto.stock, MAX_POR_LINEA);
  const puedeRestar = estado !== "agotado" && cantidad > 1;
  const puedeSumar = estado !== "agotado" && cantidad < maximo;

  return (
    <li className="grid grid-cols-[6rem_1fr] gap-x-5 gap-y-4 border-b border-line/80 py-6 sm:grid-cols-[8rem_1fr_auto] sm:gap-x-8">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-line/70 bg-paper-deep">
        <ProductImage
          src={producto.imagen}
          alt=""
          sizes={imageSizes.cartLine}
          className={estado === "agotado" ? "opacity-50 grayscale" : ""}
        />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          {producto.marca}
        </p>
        <h3 className="mt-1 font-display text-2xl leading-tight text-ink">
          <Link href={`/producto/${producto.id}`} className={enlaceProducto}>
            {producto.nombre}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          {formatPrice(producto.precioCentimos)} / unidad
        </p>

        {estado === "agotado" && (
          <p className="mt-3 text-sm font-medium text-accent">
            Agotada. No entra en el total.
          </p>
        )}
        {estado === "stock-insuficiente" && (
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-accent">
            Solo{" "}
            {producto.stock === 1
              ? "queda 1 unidad"
              : `quedan ${producto.stock} unidades`}
            ; se cuentan {linea.cantidadFacturable}.
            <button
              type="button"
              onClick={() => cambiarCantidad(anunciable, maximo, maximo)}
              className={`${botonQuitar} text-ink`}
            >
              Ajustar a {maximo}
            </button>
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          {estado !== "agotado" && (
            <div
              role="group"
              aria-label={`Cantidad de ${producto.nombre}`}
              className="inline-flex items-center rounded-full border border-line"
            >
              <button
                type="button"
                aria-label={`Restar una unidad de ${producto.nombre}`}
                aria-disabled={!puedeRestar}
                onClick={() => {
                  if (puedeRestar) {
                    cambiarCantidad(anunciable, cantidad - 1, maximo);
                  }
                }}
                className={botonPaso}
              >
                <span aria-hidden="true">−</span>
              </button>
              <span
                data-testid="cantidad"
                className="min-w-8 text-center text-base font-medium text-ink tabular-nums"
              >
                {cantidad}
              </span>
              <button
                type="button"
                aria-label={`Sumar una unidad de ${producto.nombre}`}
                aria-disabled={!puedeSumar}
                onClick={() => {
                  if (puedeSumar) {
                    cambiarCantidad(anunciable, cantidad + 1, maximo);
                  }
                }}
                className={botonPaso}
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => onQuitar(anunciable)}
            aria-label={`Eliminar ${producto.nombre} del carrito`}
            className={botonQuitar}
          >
            Eliminar
          </button>
        </div>
        {estado === "disponible" && cantidad >= maximo && (
          <p className="mt-2 text-sm text-ink-soft">
            No hay más unidades disponibles.
          </p>
        )}
      </div>

      <p className="col-start-2 font-display text-xl text-ink sm:col-start-3 sm:text-right">
        <span className="sr-only">Subtotal: </span>
        {formatPrice(linea.subtotalCentimos)}
      </p>
    </li>
  );
}

export default function CarritoVista() {
  const { lineas, hidratado, quitar, vaciar } = useCarrito();
  const ids = lineas.map((linea) => linea.productoId);
  const { conocidos, error, reintentar } = useProductosCarrito(ids, hidratado);
  const carrito = calcularCarrito(lineas, conocidos);

  // Al eliminar una línea, el botón pulsado desaparece: el foco pasa al
  // título de la lista (o del estado vacío) para no perderse en <body>.
  const titulo = useRef<HTMLHeadingElement>(null);
  const enfocarTitulo = useRef(false);
  useEffect(() => {
    if (!enfocarTitulo.current) return;
    enfocarTitulo.current = false;
    titulo.current?.focus();
  }, [lineas]);

  function onQuitar(producto: { id: number; nombre: string }) {
    enfocarTitulo.current = true;
    quitar(producto);
  }

  if (!hidratado) {
    return (
      <div className="mt-12" aria-busy="true">
        <p className="text-base text-ink-soft">Cargando tu carrito…</p>
        <noscript>
          <p className="mt-4 max-w-xl text-base text-ink-soft">
            El carrito se guarda en tu navegador y necesita JavaScript. Si lo
            prefieres, escríbenos a info@voltioymadera.es y preparamos la
            reserva.
          </p>
        </noscript>
      </div>
    );
  }

  if (lineas.length === 0) {
    return (
      <div className="mt-12 border-t border-line/80 py-20 text-center">
        <h2
          ref={titulo}
          tabIndex={-1}
          className="font-display text-h2 text-ink focus:outline-none"
        >
          Tu carrito está vacío.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-ink-soft">
          Recorre el catálogo: cada pieza pasa por el taller antes de salir.
        </p>
        <Link href="/catalogo" className={`${buttonClasses("solid")} mt-10`}>
          Ver el catálogo
        </Link>
      </div>
    );
  }

  const comprables = carrito.unidades > 0;

  return (
    <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
      <section aria-labelledby="carrito-lineas" className="lg:col-span-8">
        <h2
          id="carrito-lineas"
          ref={titulo}
          tabIndex={-1}
          className="border-b border-line/80 pb-4 text-sm font-medium uppercase tracking-[0.24em] text-ink focus:outline-none"
        >
          {lineas.length === 1
            ? "1 pieza en tu carrito"
            : `${lineas.length} piezas en tu carrito`}
        </h2>

        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/40 bg-paper-deep/60 px-5 py-4 text-sm text-ink"
          >
            No hemos podido cargar todas las piezas.
            <button
              type="button"
              onClick={reintentar}
              className={buttonClasses("outline")}
            >
              Reintentar
            </button>
          </div>
        )}

        <ul aria-busy={carrito.cargando}>
          {carrito.lineas.map((linea) => (
            <Linea key={linea.productoId} linea={linea} onQuitar={onQuitar} />
          ))}
        </ul>

        <button
          type="button"
          onClick={() => {
            enfocarTitulo.current = true;
            vaciar();
          }}
          className={`${botonQuitar} mt-6`}
        >
          Vaciar carrito
        </button>
      </section>

      <aside aria-labelledby="carrito-resumen" className="lg:col-span-4">
        <div className="rounded-[2rem] border border-line/80 bg-paper-deep/40 p-6 sm:p-8 lg:sticky lg:top-28">
          <h2
            id="carrito-resumen"
            className="text-sm font-medium uppercase tracking-[0.24em] text-ink"
          >
            Resumen
          </h2>
          <dl
            aria-busy={carrito.cargando}
            className="mt-6 divide-y divide-line/70 text-base"
          >
            <div className="flex items-baseline justify-between gap-4 pb-4">
              <dt className="text-ink-soft">
                Subtotal ({textoUnidades(carrito.unidades)})
              </dt>
              <dd className="text-ink tabular-nums">
                {formatPrice(carrito.totalCentimos)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-4">
              <dt className="text-ink-soft">Envío asegurado en península</dt>
              <dd className="text-ink">Incluido</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 pt-4">
              <dt className="font-medium text-ink">Total</dt>
              <dd
                data-testid="total-carrito"
                className="font-display text-3xl text-ink tabular-nums"
              >
                {carrito.cargando ? "…" : formatPrice(carrito.totalCentimos)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-sm text-ink-soft">IVA incluido.</p>

          {/* El checkout llega en la Fase 11: el botón existe, pero aún no
              lleva a ninguna parte. */}
          <button
            type="button"
            disabled
            aria-describedby="carrito-checkout-nota"
            className={buttonClasses("solid", "mt-8 w-full")}
          >
            Finalizar compra
          </button>
          <p
            id="carrito-checkout-nota"
            className="mt-3 text-sm leading-relaxed text-ink-soft"
          >
            {comprables
              ? "El pago online llega muy pronto. Mientras tanto, escríbenos y cerramos la compra contigo."
              : "Ninguna pieza del carrito está disponible ahora mismo."}
          </p>
          <Link
            href="/catalogo"
            className={`${buttonClasses("quiet")} mt-4 w-full`}
          >
            Seguir comprando
          </Link>
        </div>
      </aside>
    </div>
  );
}
