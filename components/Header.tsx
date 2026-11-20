"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "./ui/Container";

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
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
