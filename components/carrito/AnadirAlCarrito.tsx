"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { textoUnidades, useCarrito } from "@/features/carrito/CarritoProvider";
import { MAX_POR_LINEA } from "@/features/carrito/reducer";

type Props = {
  productoId: number;
  nombre: string;
  /** Stock del detalle; el carrito lo vuelve a comprobar en el servidor. */
  stock: number;
};

/**
 * Botón «Añadir al carrito» del detalle (Fase 10, cierra `UX-01`).
 * No deja superar el stock: cuenta lo que ya hay en el carrito. La
 * confirmación es visible aquí y la anuncia la región viva del proveedor.
 */
export default function AnadirAlCarrito({ productoId, nombre, stock }: Props) {
  const { cantidadDe, agregar, hidratado } = useCarrito();
  const [confirmado, setConfirmado] = useState(false);

  const maximo = Math.min(Math.max(stock, 0), MAX_POR_LINEA);
  const enCarrito = cantidadDe(productoId);
  const agotado = maximo === 0;
  const completo = !agotado && enCarrito >= maximo;

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        // Deshabilitado hasta hidratar: antes, un clic no haría nada y el
        // contador aún no sabe cuántas unidades hay ya en el carrito.
        disabled={!hidratado || agotado || completo}
        onClick={() => {
          agregar({ id: productoId, nombre }, maximo);
          setConfirmado(true);
        }}
        className={buttonClasses("solid", "w-full")}
      >
        {agotado
          ? "Agotado"
          : completo
            ? "Ya tienes todas las unidades"
            : "Añadir al carrito"}
      </button>

      {confirmado && enCarrito > 0 && (
        <p className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper-deep/60 px-5 py-3 text-sm text-ink">
          <span>
            <span aria-hidden="true">✓ </span>
            En tu carrito: {textoUnidades(enCarrito)}
          </span>
          <Link
            href="/carrito"
            className="rounded-sm font-medium uppercase tracking-[0.16em] underline-offset-4 hover:text-accent hover:underline"
          >
            Ver carrito →
          </Link>
        </p>
      )}

      <noscript>
        <p className="text-sm text-ink-soft">
          El carrito necesita JavaScript. Si lo prefieres, consulta la
          disponibilidad por correo.
        </p>
      </noscript>
    </div>
  );
}
