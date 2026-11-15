# GUITAR-SHOP

A boutique guitar storefront built with React 19 and Vite. It is a single-page
application with a catalog of instruments, a product detail view and the usual
static pages (home, about, contact, 404). The storefront brand is **Voltio &
Madera**.

The interface copy is in Spanish; the codebase and its tooling are documented in
English.

## Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| UI         | React 19 (JavaScript, JSX)                   |
| Build      | Vite 8                                       |
| Routing    | React Router DOM 7 (`BrowserRouter` + `Routes`) |
| Styling    | Tailwind CSS 4 (via `@tailwindcss/vite`)     |
| Icons      | React Icons                                  |
| Linting    | ESLint 10 (flat config)                      |

## Requirements

- Node.js `>=22.12.0` (see `.nvmrc`)
- pnpm `>=10` — **this project uses pnpm**; `package-lock.json` and `yarn.lock`
  are git-ignored on purpose

## Getting started

```bash
pnpm install
pnpm dev
```

The dev server runs on `http://localhost:5173`.

## Scripts

| Command        | Description                        |
| -------------- | ---------------------------------- |
| `pnpm dev`     | Start the Vite dev server with HMR |
| `pnpm build`   | Build for production into `dist/`  |
| `pnpm preview` | Serve the production build locally |
| `pnpm lint`    | Run ESLint over the whole project  |

## Project structure

```text
.
├── public/                  # Static assets served as-is
│   └── fonts/               # Self-hosted woff2 subsets (Bodoni Moda + Inter)
├── src/
│   ├── components/          # Shared presentational components
│   │   ├── ui/              # Container, Button, PageTitle and shared styles
│   │   ├── ErrorBoundary.jsx
│   │   ├── Footer.jsx
│   │   ├── GuitarCard.jsx
│   │   └── Header.jsx
│   ├── data/                # Local product data
│   │   └── guitarras.js
│   ├── hooks/               # Reusable hooks
│   │   └── useReveal.js
│   ├── layout/              # Route layout (header + main + footer)
│   │   └── Layout.jsx
│   ├── pages/               # Route-level components
│   │   ├── Acerca.jsx
│   │   ├── Catalogo.jsx
│   │   ├── Contactanos.jsx
│   │   ├── Error404.jsx
│   │   ├── Home.jsx
│   │   └── Producto.jsx
│   ├── utils/               # Shared helpers
│   │   └── formatPrice.js
│   ├── App.jsx              # Route definitions
│   ├── index.css            # Tailwind entry, tokens, fonts and motion
│   └── main.jsx             # Application entry point
├── docs/
│   ├── AUDITORIA_TECNICA.md # Technical audit and improvement roadmap
│   └── DIRECCION_DE_ARTE.md # Art direction and design system
├── eslint.config.js
└── vite.config.js
```

## Routes

| Path             | Page              |
| ---------------- | ----------------- |
| `/`              | Home              |
| `/catalogo`      | Product catalog   |
| `/producto/:id`  | Product detail    |
| `/acerca`        | About             |
| `/contacto`      | Contact           |
| `*`              | 404 Not found     |

Because routing is client-side, a production host must rewrite unknown paths to
`index.html`; otherwise reloading `/producto/3` returns a server 404.

## Conventions

- **Language:** domain names in Spanish (`guitarra`, `precio`), infrastructure
  and tooling in English (`getGuitarras`, `formatPrice`).
- **Components:** one component per file, default export, `PascalCase` filename.
- **Styling:** Tailwind utilities only; design tokens live in `@theme` inside
  `src/index.css` (`paper`, `ink`, `accent`, fluid type scale). No CSS modules
  or inline styles beyond CSS custom properties for stagger indexes.
- **Prices:** always through `formatPrice` (`es-ES`, EUR) — never
  `toLocaleString()` in components.
- **Data access:** components should not import `src/data` directly once a data
  layer exists; see the roadmap in the audit.

## Design system

The visual direction is documented in
[`docs/DIRECCION_DE_ARTE.md`](docs/DIRECCION_DE_ARTE.md). In short:

- **Type:** Bodoni Moda (display) + Inter (UI), self-hosted variable woff2
  subsets in `public/fonts/` (~95 kB total).
- **Tokens:** warm paper/ink palette, 1 px rules, fluid display scale with
  `clamp()`, maximum 3 weights.
- **Layout:** 12-column editorial grid; the catalog alternates 7/5 and 5/7
  cards instead of a uniform three-up grid.
- **Motion:** CSS plus `useReveal` (`IntersectionObserver`); only `transform`
  and `opacity`. `prefers-reduced-motion: reduce` disables every non-essential
  animation and leaves all content visible.

## Known technical debt

The current state, findings and phased roadmap live in
[`docs/AUDITORIA_TECNICA.md`](docs/AUDITORIA_TECNICA.md). Notable items:

- No automated tests and no CI yet.
- Product images are remote and unoptimized (Phase 4).
- SEO metadata is still the Vite template default (Phase 5).
- Components still import `src/data` directly; the service layer arrives in
  Phase 7.

## License

Private project. All rights reserved.
