import { Link, NavLink, useLocation } from "react-router-dom";
import Container from "./ui/Container";

const navItems = [
  { to: "/", label: "Inicio", end: true },
  { to: "/catalogo", label: "Catálogo", section: "/producto" },
  { to: "/acerca", label: "Taller" },
  { to: "/contacto", label: "Contacto" },
];

function navClasses(isActive) {
  return [
    "nav-link inline-block py-1 text-sm font-medium uppercase tracking-[0.14em] transition-colors",
    isActive ? "text-ink" : "text-ink-soft hover:text-ink",
  ].join(" ");
}

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-4">
        <Link
          to="/"
          className="group flex items-baseline gap-3 rounded-sm"
          aria-label="Voltio & Madera — Inicio"
        >
          <span className="font-display text-2xl leading-none text-ink transition-colors group-hover:text-accent sm:text-3xl">
            Voltio &amp; Madera
          </span>
          <span className="hidden text-sm uppercase tracking-[0.22em] text-ink-soft sm:inline">
            Est. 1994
          </span>
        </Link>

        <nav aria-label="Navegación principal">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 sm:gap-x-7">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    navClasses(
                      isActive ||
                        (item.section && pathname.startsWith(item.section)),
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
