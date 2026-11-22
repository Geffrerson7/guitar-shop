"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type HTMLInputAutoCompleteAttribute,
  type HTMLInputTypeAttribute,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { confirmarPedido } from "@/app/checkout/actions";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { calcularCarrito } from "@/features/carrito/calculo";
import { textoUnidades, useCarrito } from "@/features/carrito/CarritoProvider";
import { useProductosCarrito } from "@/features/carrito/useProductosCarrito";
import {
  CAMPOS_CHECKOUT,
  ESTADO_INICIAL,
  type CampoCheckout,
  type ErroresCheckout,
  type ProblemaLinea,
} from "@/features/checkout/tipos";
import { formatPrice } from "@/utils/formatPrice";

/*
 * Formulario de checkout (Fase 11).
 *
 * - Envía a la Server Action `confirmarPedido`, que lo valida todo de nuevo y
 *   recalcula el total con los precios de la base de datos. El resumen de
 *   aquí es solo lo que se enseña.
 * - El envío va dentro de una transición desde `onSubmit` (no con la prop
 *   `action`), para que React no vacíe los campos al volver con errores.
 * - Doble envío: el botón no hace nada mientras hay un envío en curso y cada
 *   intento lleva una clave de idempotencia; el servidor devuelve el mismo
 *   pedido si la clave se repite.
 * - Errores por campo asociados con `aria-describedby`; el foco va al primero.
 * - Al confirmarse se vacía el carrito y se navega a /pedido/[codigo].
 */

const etiqueta = "mb-2 block text-sm font-medium text-ink";
const campo =
  "w-full rounded-2xl border border-line bg-paper px-4 py-3 text-base text-ink transition-colors hover:border-ink/40 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-invalid:border-accent";
const leyenda = "mb-6 text-sm font-medium uppercase tracking-[0.24em] text-ink";
const enlaceTexto =
  "rounded-sm font-medium text-ink underline underline-offset-4 transition-colors hover:text-accent";

const idCampo = (nombre: CampoCheckout) => `checkout-${nombre}`;
const idError = (nombre: CampoCheckout) => `checkout-${nombre}-error`;

function CampoTexto({
  nombre,
  etiqueta: texto,
  errores,
  type = "text",
  autoComplete,
  opcional = false,
  ayuda,
  inputMode,
  maxLength,
}: {
  nombre: CampoCheckout;
  etiqueta: string;
  errores: ErroresCheckout;
  type?: HTMLInputTypeAttribute;
  autoComplete: HTMLInputAutoCompleteAttribute;
  opcional?: boolean;
  ayuda?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  maxLength: number;
}) {
  const error = errores[nombre];
  const idAyuda = `${idCampo(nombre)}-ayuda`;
  const descripcion =
    [error ? idError(nombre) : null, ayuda ? idAyuda : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div>
      <label htmlFor={idCampo(nombre)} className={etiqueta}>
        {texto}
        {opcional && (
          <span className="font-normal text-ink-soft"> (opcional)</span>
        )}
      </label>
      <input
        id={idCampo(nombre)}
        name={nombre}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        required={!opcional}
        aria-invalid={error ? true : undefined}
        aria-describedby={descripcion}
        className={campo}
      />
      {ayuda && (
        <p id={idAyuda} className="mt-2 text-sm text-ink-soft">
          {ayuda}
        </p>
      )}
      {error && (
        <p
          id={idError(nombre)}
          className="mt-2 text-sm font-medium text-accent"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function textoProblema({ nombre, motivo, disponibles }: ProblemaLinea): string {
  const pieza = nombre ?? "Una pieza del carrito";
  if (motivo === "no-disponible") return `${pieza} ya no está a la venta.`;
  if (motivo === "agotado") return `${pieza} se ha agotado.`;
  return `${pieza}: solo ${
    disponibles === 1 ? "queda 1 unidad" : `quedan ${disponibles} unidades`
  }.`;
}

/**
 * El carrito vive en el navegador: hasta hidratar no se sabe qué hay en él,
 * así que el formulario (y su clave de idempotencia) solo existe en cliente.
 */
export default function FormularioCheckout() {
  const { hidratado } = useCarrito();

  if (!hidratado) {
    return (
      <div className="mt-12" aria-busy="true">
        <p className="text-base text-ink-soft">Cargando tu pedido…</p>
        <noscript>
          <p className="mt-4 max-w-xl text-base text-ink-soft">
            El carrito se guarda en tu navegador y el pedido necesita
            JavaScript. Si lo prefieres, escríbenos a info@voltioymadera.es y
            cerramos la compra contigo.
          </p>
        </noscript>
      </div>
    );
  }
  return <Checkout />;
}

function Checkout() {
  const router = useRouter();
  const { lineas, hidratado, vaciar } = useCarrito();
  const ids = lineas.map((linea) => linea.productoId);
  const {
    conocidos,
    error: errorCarga,
    reintentar,
  } = useProductosCarrito(ids, hidratado);
  const carrito = calcularCarrito(lineas, conocidos);

  const [estado, enviar, enviando] = useActionState(
    confirmarPedido,
    ESTADO_INICIAL,
  );
  // Una clave por intento de compra, generada en el navegador (este
  // componente solo se monta después de hidratar).
  const [clave] = useState(() => crypto.randomUUID());

  const aviso = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (estado.estado === "ok") {
      vaciar();
      router.replace(`/pedido/${estado.codigo}`);
      return;
    }
    if (estado.estado === "error-campos") {
      const primero = CAMPOS_CHECKOUT.find((c) => estado.errores[c]);
      if (primero) document.getElementById(idCampo(primero))?.focus();
      return;
    }
    if (estado.estado === "error" || estado.estado === "error-stock") {
      aviso.current?.focus();
    }
    // `vaciar` cambia con el carrito; solo interesa reaccionar al resultado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  function onSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando || estado.estado === "ok") return;
    const datos = new FormData(evento.currentTarget);
    startTransition(() => enviar(datos));
  }

  if (estado.estado === "ok") {
    return (
      <p role="status" className="mt-12 text-base text-ink-soft">
        Pedido registrado. Abriendo la confirmación…
      </p>
    );
  }

  if (lineas.length === 0) {
    return (
      <div className="mt-12 border-t border-line/80 py-20 text-center">
        <h2 className="font-display text-h2 text-ink">
          Tu carrito está vacío.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-ink-soft">
          Añade alguna pieza antes de finalizar la compra.
        </p>
        <Link href="/catalogo" className={`${buttonClasses("solid")} mt-10`}>
          Ver el catálogo
        </Link>
      </div>
    );
  }

  const bloqueado =
    !carrito.cargando &&
    carrito.lineas.some((linea) => linea.estado !== "disponible");
  const errores = estado.estado === "error-campos" ? estado.errores : {};
  const lineasEnviadas = JSON.stringify(
    lineas.map(({ productoId, cantidad }) => ({ productoId, cantidad })),
  );

  return (
    <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
      <form
        onSubmit={onSubmit}
        noValidate
        aria-labelledby="checkout-titulo-formulario"
        className="lg:col-span-7"
      >
        <h2 id="checkout-titulo-formulario" className="sr-only">
          Datos del pedido
        </h2>

        {(estado.estado === "error" || estado.estado === "error-stock") && (
          <div
            ref={aviso}
            tabIndex={-1}
            role="alert"
            className="mb-10 rounded-2xl border border-accent/40 bg-paper-deep/60 px-5 py-4 text-base text-ink focus:outline-none"
          >
            {estado.estado === "error" ? (
              <p>{estado.mensaje}</p>
            ) : (
              <>
                <p className="font-medium">
                  No hemos creado el pedido: el stock ha cambiado mientras
                  comprabas.
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  {estado.problemas.map((problema) => (
                    <li key={problema.productoId}>{textoProblema(problema)}</li>
                  ))}
                </ul>
                <p className="mt-3">
                  <Link href="/carrito" className={enlaceTexto}>
                    Vuelve al carrito para ajustarlo
                  </Link>
                  .
                </p>
              </>
            )}
          </div>
        )}

        <fieldset>
          <legend className={leyenda}>Contacto</legend>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <CampoTexto
                nombre="nombre"
                etiqueta="Nombre y apellidos"
                autoComplete="name"
                maxLength={100}
                errores={errores}
              />
            </div>
            <CampoTexto
              nombre="email"
              etiqueta="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              ayuda="Solo para escribirte sobre este pedido."
              errores={errores}
            />
            <CampoTexto
              nombre="telefono"
              etiqueta="Teléfono"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={20}
              opcional
              ayuda="Por si el transportista necesita avisarte."
              errores={errores}
            />
          </div>
        </fieldset>

        <fieldset className="mt-12">
          <legend className={leyenda}>Envío</legend>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <CampoTexto
                nombre="direccion"
                etiqueta="Dirección"
                autoComplete="street-address"
                maxLength={200}
                errores={errores}
              />
            </div>
            <CampoTexto
              nombre="codigoPostal"
              etiqueta="Código postal"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              ayuda="Enviamos a la península."
              errores={errores}
            />
            <CampoTexto
              nombre="localidad"
              etiqueta="Localidad"
              autoComplete="address-level2"
              maxLength={100}
              errores={errores}
            />
            <CampoTexto
              nombre="provincia"
              etiqueta="Provincia"
              autoComplete="address-level1"
              maxLength={100}
              errores={errores}
            />
          </div>
        </fieldset>

        <fieldset className="mt-12">
          <legend className={leyenda}>Pago</legend>
          <p
            id="checkout-pago"
            className="rounded-2xl border border-line bg-paper-deep/40 px-5 py-4 text-base text-ink"
          >
            <strong className="font-medium">
              Pago simulado — no se realiza ningún cargo.
            </strong>{" "}
            Es una tienda de demostración: no pedimos ningún dato de pago y el
            pedido se registra sin cobrar nada.
          </p>
        </fieldset>

        <div className="mt-10">
          <div className="flex items-start gap-3">
            <input
              id={idCampo("consentimiento")}
              name="consentimiento"
              type="checkbox"
              required
              aria-invalid={errores.consentimiento ? true : undefined}
              aria-describedby={
                errores.consentimiento ? idError("consentimiento") : undefined
              }
              className="mt-1 size-5 shrink-0 accent-ink"
            />
            <label
              htmlFor={idCampo("consentimiento")}
              className="text-base leading-relaxed text-ink-soft"
            >
              He leído el{" "}
              <Link href="/privacidad" className={enlaceTexto}>
                aviso de privacidad
              </Link>{" "}
              y acepto que Voltio &amp; Madera use estos datos para tramitar y
              enviar mi pedido.
            </label>
          </div>
          {errores.consentimiento && (
            <p
              id={idError("consentimiento")}
              className="mt-2 text-sm font-medium text-accent"
            >
              {errores.consentimiento}
            </p>
          )}
        </div>

        <input type="hidden" name="lineas" value={lineasEnviadas} />
        <input type="hidden" name="claveIdempotencia" value={clave} />

        <button
          type="submit"
          // `aria-disabled` y no `disabled`: el foco no se pierde mientras se
          // envía; `onSubmit` ignora los envíos repetidos.
          aria-disabled={enviando || bloqueado || carrito.cargando}
          aria-describedby="checkout-pago"
          onClick={(evento) => {
            if (bloqueado || carrito.cargando) evento.preventDefault();
          }}
          className={buttonClasses(
            "solid",
            "mt-10 w-full aria-disabled:cursor-not-allowed aria-disabled:opacity-45 sm:w-auto",
          )}
        >
          {enviando
            ? "Confirmando pedido…"
            : `Confirmar pedido${
                carrito.cargando
                  ? ""
                  : ` · ${formatPrice(carrito.totalCentimos)}`
              }`}
        </button>
      </form>

      <aside aria-labelledby="checkout-resumen" className="lg:col-span-5">
        <div className="rounded-[2rem] border border-line/80 bg-paper-deep/40 p-6 sm:p-8 lg:sticky lg:top-28">
          <h2
            id="checkout-resumen"
            className="text-sm font-medium uppercase tracking-[0.24em] text-ink"
          >
            Tu pedido
          </h2>

          {errorCarga && (
            <div role="alert" className="mt-4 text-sm text-ink">
              No hemos podido cargar todas las piezas.{" "}
              <button
                type="button"
                onClick={reintentar}
                className={enlaceTexto}
              >
                Reintentar
              </button>
            </div>
          )}

          <ul
            aria-busy={carrito.cargando}
            className="mt-6 divide-y divide-line/70 text-base"
          >
            {carrito.lineas.map((linea) => (
              <li
                key={linea.productoId}
                className="flex items-baseline justify-between gap-4 py-3"
              >
                <span className="min-w-0 text-ink">
                  {linea.producto?.nombre ??
                    (linea.estado === "cargando"
                      ? "Cargando pieza…"
                      : "Pieza no disponible")}
                  <span className="text-ink-soft"> × {linea.cantidad}</span>
                </span>
                <span className="shrink-0 text-ink tabular-nums">
                  {linea.producto ? formatPrice(linea.subtotalCentimos) : "—"}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 divide-y divide-line/70 border-t border-line/70 text-base">
            <div className="flex items-baseline justify-between gap-4 py-4">
              <dt className="text-ink-soft">Envío asegurado en península</dt>
              <dd className="text-ink">Incluido</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 pt-4">
              <dt className="font-medium text-ink">
                Total ({textoUnidades(carrito.unidades)})
              </dt>
              <dd
                data-testid="total-checkout"
                className="font-display text-3xl text-ink tabular-nums"
              >
                {carrito.cargando ? "…" : formatPrice(carrito.totalCentimos)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-sm text-ink-soft">IVA incluido.</p>

          {bloqueado && (
            <p className="mt-6 text-sm font-medium text-accent">
              Alguna pieza ha cambiado de disponibilidad.{" "}
              <Link href="/carrito" className={enlaceTexto}>
                Revisa el carrito
              </Link>{" "}
              antes de confirmar.
            </p>
          )}

          <Link
            href="/carrito"
            className={`${buttonClasses("quiet")} mt-6 w-full`}
          >
            Volver al carrito
          </Link>
        </div>
      </aside>
    </div>
  );
}
