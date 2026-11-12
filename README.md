# GUITAR-SHOP

A boutique guitar storefront built with React 19 and Vite. It is a single-page
application with a catalog of instruments, a product detail view and the usual
static pages (home, about, contact, 404).

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
├── src/
│   ├── assets/              # Assets imported by the bundler
│   ├── components/          # Shared presentational components
│   │   ├── Footer.jsx
│   │   ├── GuitarCard.jsx
│   │   └── Header.jsx
│   ├── data/                # Local product data
│   │   └── guitarras.js
│   ├── layout/              # Route layout (header + main + footer)
│   │   └── Layout.jsx
│   ├── pages/               # Route-level components
│   │   ├── Acerca.jsx
│   │   ├── Catalogo.jsx
│   │   ├── Contactanos.jsx
│   │   ├── Error404.jsx
│   │   ├── Home.jsx
│   │   └── Producto.jsx
│   ├── App.jsx              # Route definitions
│   ├── index.css            # Tailwind entry point
│   └── main.jsx             # Application entry point
├── docs/
│   └── AUDITORIA_TECNICA.md # Technical audit and improvement roadmap
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
- **Styling:** Tailwind utilities only; no CSS modules or inline styles.
- **Data access:** components should not import `src/data` directly once a data
  layer exists; see the roadmap in the audit.

## Known technical debt

The current state, findings and phased roadmap live in
[`docs/AUDITORIA_TECNICA.md`](docs/AUDITORIA_TECNICA.md). Notable items:

- No automated tests and no CI yet.
- Product images are remote and unoptimized.
- SEO metadata is still the Vite template default.
- Accessibility gaps in the header and footer.

## License

Private project. All rights reserved.
