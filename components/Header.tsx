"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LinkSpinner from "./LinkSpinner";
import Container from "./ui/Container";
import { textoUnidades, useCarrito } from "@/features/carrito/CarritoProvider";

type NavItem = {
  href: string;
  label: string;
  /** Prefijo de ruta adicional que también marca el enlace como activo. */
  section?: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo", section: "/producto" },
  { href: "/acerca", label: "Taller" },
  { href: "/contacto", label: "Contacto" },
];

/** Coincidencia de ruta equivalente a `NavLink` (con `end` en la raíz). */
function isCurrent(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navClasses(active: boolean): string {
  return [
    "nav-link inline-block py-1 text-sm font-medium uppercase tracking-[0.14em] transition-colors",
    active ? "text-ink" : "text-ink-soft hover:text-ink",
  ].join(" ");
}

/** Carro de supermercado, decorativo: el nombre lo pone el enlace. */
function IconoCarrito() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
    >
      <path d="M2.5 3.5h2.2l2.4 11.3a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1l1.8-6.9H5.8" />
      <circle cx="9.5" cy="19.5" r="1.25" />
      <circle cx="17" cy="19.5" r="1.25" />
    </svg>
  );
}

/**
 * Enlace al carrito con contador (Fase 10). Es un enlace y no un botón porque
 * navega a /carrito. El nombre accesible incluye el número visible del
 * contador (WCAG 2.5.3); los cambios los anuncia la región viva del
 * `CarritoProvider`, no este enlace.
 */
function EnlaceCarrito({ actual }: { actual: boolean }) {
  const { unidades } = useCarrito();
  const nombre =
    unidades === 0 ? "Carrito, vacío" : `Carrito, ${textoUnidades(unidades)}`;

  return (
    <Link
      href="/carrito"
      aria-label={nombre}
      aria-current={actual ? "page" : undefined}
      className={`relative inline-flex size-11 items-center justify-center rounded-full transition-colors ${
        actual ? "text-ink" : "text-ink-soft hover:text-ink"
      }`}
    >
      <IconoCarrito />
      {unidades > 0 && (
        <span
          aria-hidden="true"
          data-testid="contador-carrito"
          className="absolute -top-0.5 -right-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs leading-5 font-medium text-paper tabular-nums"
        >
          {unidades > 99 ? "99+" : unidades}
        </span>
      )}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-4">
        {/* Nombre accesible desde el contenido visible (WCAG 2.5.3), con el
            destino solo para lectores de pantalla. */}
        <Link href="/" className="group flex items-baseline gap-3 rounded-sm">
          <span className="font-display text-2xl leading-none text-ink transition-colors group-hover:text-accent sm:text-3xl">
            Voltio &amp; Madera
          </span>{" "}
          <span className="hidden text-sm uppercase tracking-[0.22em] text-ink-soft sm:inline">
            Est. 1994
          </span>
          <span className="sr-only"> — Inicio</span>
        </Link>

        <nav aria-label="Navegación principal">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 sm:gap-x-7">
            {navItems.map((item) => {
              const current = isCurrent(pathname, item.href);
              const active =
                current ||
                (item.section !== undefined &&
                  pathname.startsWith(item.section));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={navClasses(active)}
                  >
                    {item.href === "/catalogo" ? (
                      <LinkSpinner>{item.label}</LinkSpinner>
                    ) : (
                      item.label
                    )}
                  </Link>
                </li>
              );
            })}
            <li>
              <EnlaceCarrito actual={pathname === "/carrito"} />
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}
