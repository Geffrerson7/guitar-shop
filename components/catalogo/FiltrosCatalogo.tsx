"use client";

import { useEffect, useRef, type FormEvent } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/buttonStyles";
import {
  hayFiltrosActivos,
  hrefDesdeFormulario,
  ordenes,
  type FiltrosCatalogo as Filtros,
} from "@/lib/catalogo-url";
import type { Categoria } from "@/types/guitarra";
import { useNavegacionCatalogo } from "./NavegacionCatalogo";

/*
 * Búsqueda, filtros y orden del catálogo (Fase 9).
 *
 * Es un formulario GET normal hacia /catalogo: sin JavaScript se envía con el
 * botón «Aplicar» y el servidor filtra. Con JavaScript, el formulario solo
 * actualiza la URL:
 *   - selects → al cambiar (push: el botón Atrás deshace el filtro);
 *   - texto y precios → con debounce (replace: no llena el historial con
 *     cada pulsación).
 * Los campos no son controlados por React, así que escribir nunca espera a
 * la red. Cuando la URL cambia desde fuera (Atrás, «Limpiar filtros»), los
 * campos se sincronizan salvo el que tiene el foco.
 */

const DEBOUNCE_MS = 350;

const etiqueta =
  "mb-2 block text-sm font-medium uppercase tracking-[0.16em] text-ink-soft";
const campo =
  "w-full rounded-2xl border border-line bg-paper px-4 py-3 text-base text-ink transition-colors placeholder:text-ink-soft/70 hover:border-ink/40 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type Props = {
  filtros: Filtros;
  categorias: Categoria[];
  marcas: string[];
};

/** Valor de cada campo del formulario para unos filtros. */
function valoresDeCampos(filtros: Filtros): Record<string, string> {
  return {
    q: filtros.q ?? "",
    categoria: filtros.categoria ?? "",
    marca: filtros.marca ?? "",
    precioMin: filtros.precioMin?.toString() ?? "",
    precioMax: filtros.precioMax?.toString() ?? "",
    orden: filtros.orden,
  };
}

export default function FiltrosCatalogo({
  filtros,
  categorias,
  marcas,
}: Props) {
  const { navegar, pendiente } = useNavegacionCatalogo();
  const formRef = useRef<HTMLFormElement>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  // URL → campos (Atrás, Adelante, «Limpiar filtros»).
  const firma = JSON.stringify(valoresDeCampos(filtros));
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const valores: Record<string, string> = JSON.parse(firma);
    for (const [nombre, valor] of Object.entries(valores)) {
      const elemento = form.elements.namedItem(nombre);
      if (
        (elemento instanceof HTMLInputElement ||
          elemento instanceof HTMLSelectElement) &&
        elemento !== document.activeElement &&
        elemento.value !== valor
      ) {
        elemento.value = valor;
      }
    }
  }, [firma]);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  /** Campos → URL. Cambiar cualquier filtro vuelve a la página 1. */
  function aplicar(reemplazar: boolean) {
    clearTimeout(temporizador.current);
    const form = formRef.current;
    if (!form) return;
    navegar(hrefDesdeFormulario(new FormData(form)), { reemplazar });
  }

  function aplicarConRetardo() {
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => aplicar(true), DEBOUNCE_MS);
  }

  function onSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    aplicar(false);
  }

  const valores = valoresDeCampos(filtros);

  return (
    <form
      ref={formRef}
      role="search"
      aria-label="Buscar y filtrar el catálogo"
      action="/catalogo"
      method="get"
      onSubmit={onSubmit}
      className="mt-10 border-b border-line/80 pb-10"
    >
      <div>
        <label htmlFor="catalogo-q" className={etiqueta}>
          Buscar
        </label>
        <input
          id="catalogo-q"
          name="q"
          type="search"
          defaultValue={valores.q}
          placeholder="Nombre o marca, p. ej. «Gibson»"
          autoComplete="off"
          enterKeyHint="search"
          maxLength={100}
          onChange={aplicarConRetardo}
          className={campo}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <label htmlFor="catalogo-categoria" className={etiqueta}>
            Categoría
          </label>
          <select
            id="catalogo-categoria"
            name="categoria"
            defaultValue={valores.categoria}
            onChange={() => aplicar(false)}
            className={campo}
          >
            <option value="">Todas</option>
            {categorias.map((categoria) => (
              <option key={categoria.slug} value={categoria.slug}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-3">
          <label htmlFor="catalogo-marca" className={etiqueta}>
            Marca
          </label>
          <select
            id="catalogo-marca"
            name="marca"
            defaultValue={valores.marca}
            onChange={() => aplicar(false)}
            className={campo}
          >
            <option value="">Todas</option>
            {marcas.map((marca) => (
              <option key={marca} value={marca}>
                {marca}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-3">
          <legend className={etiqueta}>Precio (€)</legend>
          <div>
            <label htmlFor="catalogo-precio-min" className="sr-only">
              Precio mínimo en euros
            </label>
            <input
              id="catalogo-precio-min"
              name="precioMin"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="Desde"
              defaultValue={valores.precioMin}
              onChange={aplicarConRetardo}
              className={campo}
            />
          </div>
          <div>
            <label htmlFor="catalogo-precio-max" className="sr-only">
              Precio máximo en euros
            </label>
            <input
              id="catalogo-precio-max"
              name="precioMax"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="Hasta"
              defaultValue={valores.precioMax}
              onChange={aplicarConRetardo}
              className={campo}
            />
          </div>
        </fieldset>

        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="catalogo-orden" className={etiqueta}>
            Ordenar por
          </label>
          <select
            id="catalogo-orden"
            name="orden"
            defaultValue={valores.orden}
            onChange={() => aplicar(false)}
            className={campo}
          >
            {ordenes.map((orden) => (
              <option key={orden.valor} value={orden.valor}>
                {orden.etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="submit" className={buttonClasses("solid")}>
          Aplicar
        </button>
        {hayFiltrosActivos(filtros) && (
          <Link
            href="/catalogo"
            scroll={false}
            className={buttonClasses("quiet")}
          >
            Limpiar filtros
          </Link>
        )}
        <span
          aria-hidden="true"
          className={`text-sm text-ink-soft transition-opacity ${pendiente ? "opacity-100" : "opacity-0"}`}
        >
          Actualizando…
        </span>
      </div>
    </form>
  );
}
