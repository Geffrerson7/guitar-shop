# GUITAR-SHOP

A boutique guitar storefront built with Next.js (App Router) and TypeScript.
It has a catalog of instruments, a product detail view and the usual static
pages (home, about, contact, 404). The storefront brand is **Voltio & Madera**.

The project is evolving into a portfolio e-commerce platform (database, cart,
simulated checkout, admin panel). The roadmap lives in
[`docs/AUDITORIA_TECNICA.md`](docs/AUDITORIA_TECNICA.md).

The interface copy is in Spanish; the codebase and its tooling are documented in
English.

## Stack

| Layer      | Technology                                                  |
| ---------- | ----------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)                          |
| Language   | TypeScript 6 (`strict`, no explicit `any`)                  |
| UI         | React 19 — Server Components by default                     |
| Styling    | Tailwind CSS 4 (via `@tailwindcss/postcss`)                 |
| Linting    | ESLint 10 flat config with `eslint-config-next` (+ TS rules) |
| Hosting    | Vercel for now — no platform-only APIs (see below)          |

## Requirements

- Node.js `>=22.12.0` (see `.nvmrc`)
- pnpm `>=10` — **this project uses pnpm**; `package-lock.json` and `yarn.lock`
  are git-ignored on purpose

## Getting started

```bash
pnpm install
pnpm dev
```

The dev server runs on `http://localhost:3000`.

## Scripts

| Command          | Description                                          |
| ---------------- | ---------------------------------------------------- |
| `pnpm dev`       | Start the Next.js dev server                         |
| `pnpm build`     | Production build into `.next/`                       |
| `pnpm start`     | Serve the production build (any Node server)         |
| `pnpm lint`      | Run ESLint over the whole project                    |
| `pnpm typecheck` | Generate route types and run `tsc --noEmit`          |

## Project structure

```text
.
├── app/                     # App Router: one folder per route (routing only)
│   ├── layout.tsx           # <html lang="es">, skip link, header, <main>, footer
│   ├── template.tsx         # Per-navigation entry animation
│   ├── page.tsx             # /
│   ├── catalogo/            # /catalogo
│   ├── producto/[id]/       # /producto/:id (+ its own not-found.tsx)
│   ├── contacto/            # /contacto
│   ├── acerca/              # /acerca
│   ├── not-found.tsx        # 404
│   ├── error.tsx            # Route error boundary (retry)
│   ├── global-error.tsx     # Root layout error boundary
│   └── globals.css          # Tailwind entry, tokens and motion
├── assets/                  # Files imported by code (hashed and optimized at build)
│   ├── fonts/               # Self-hosted woff2 subsets (Bodoni Moda + Inter)
│   └── guitarras/           # Product images (WebP sources, 512×512)
├── components/              # Shared components
│   └── ui/                  # Container, Button, PageTitle and shared styles
├── data/                    # Local product data (only read by lib/)
├── hooks/                   # Client hooks (useReveal)
├── lib/                     # Data access layer (getGuitarras…)
├── types/                   # Domain types (Guitarra, Categoria)
├── utils/                   # Pure helpers (formatPrice, staggerStyle)
├── public/                  # Static files served as-is
│   └── favicon.svg
├── docs/
│   ├── AUDITORIA_TECNICA.md # Technical audit and improvement roadmap
│   └── DIRECCION_DE_ARTE.md # Art direction and design system
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

## Routes

| Path             | Rendering                          | Notes                                    |
| ---------------- | ---------------------------------- | ---------------------------------------- |
| `/`              | Static                             |                                          |
| `/catalogo`      | Static                             |                                          |
| `/producto/[id]` | SSG (`generateStaticParams`)       | Unknown or invalid id → real HTTP 404    |
| `/acerca`        | Static                             |                                          |
| `/contacto`      | Static                             |                                          |
| anything else    | `not-found.tsx`                    | HTTP 404                                 |

Routes are resolved on the server, so deep links and reloads work without any
hosting rewrite.

## Server / client boundary

Every component is a **Server Component** unless it needs state, effects or
browser APIs. Only these files declare `"use client"`:

| File                         | Why                                               |
| ---------------------------- | ------------------------------------------------- |
| `components/Header.tsx`      | Active link via `usePathname`                     |
| `components/Reveal.tsx`      | Reveal on scroll (`IntersectionObserver`)         |
| `hooks/useReveal.ts`         | Hook used by `Reveal`                             |
| `app/error.tsx`              | Error boundaries must be Client Components        |
| `app/global-error.tsx`       | Same, for the root layout                         |

The brand ticker is pure CSS and stays on the server. Pages read data through
`lib/guitarras.ts`; no component imports `data/` directly.

## Conventions

- **Language:** domain in Spanish (`Guitarra`, `Categoria`, `precio`, route
  segments such as `catalogo` or `producto`), infrastructure and tooling in
  English (`getGuitarras`, `formatPrice`, `staggerStyle`, `Container`). UI copy
  is always Spanish.
- **Components:** one component per file, default export, `PascalCase` filename.
- **Folders:** no `src/` directory. `app/` holds routing only (pages, layouts,
  error and not-found files); shared code lives in sibling top-level folders
  (`components/`, `lib/`, `data/`, `types/`, `hooks/`, `utils/`).
- **Imports:** `@/*` maps to the project root (`@/components/…`, `@/lib/…`).
- **Types:** `strict: true`; no explicit `any`, no `@ts-ignore` (both enforced by
  ESLint).
- **Styling:** Tailwind utilities only; design tokens live in `@theme` inside
  `app/globals.css` (`paper`, `ink`, `accent`, fluid type scale).
- **Prices:** always through `formatPrice` (`es-ES`, EUR) — never
  `toLocaleString()` in components.
- **Data access:** async functions in `lib/` (`getGuitarras`,
  `getGuitarraById`, `getCategorias`). In Phase 8 they switch to PostgreSQL
  without touching the pages.

## Hosting

Vercel is the current choice and gives preview deployments per pull request.
It is provisional, so the app avoids platform-only APIs: `pnpm build` +
`pnpm start` runs it on any Node server.

## Images

Product images go through `components/ProductImage.tsx`, a thin wrapper over
`next/image` (`fill` + `sizes`). It accepts a static import (today) or a
remote URL (Cloudinary, Phase 13), so pages do not change when the source does.

- Served as AVIF with WebP fallback (`images.formats` in `next.config.ts`).
- `sizes` presets per layout live next to the component (`imageSizes`).
- Lazy by default; pass `lcp` only to the LCP image of a route (Home hero,
  first catalog card, product detail), which switches it to
  `loading="eager"` + `fetchPriority="high"`.
- No remote origins are allowed yet (`remotePatterns: []`).

## Design system

The visual direction is documented in
[`docs/DIRECCION_DE_ARTE.md`](docs/DIRECCION_DE_ARTE.md). In short:

- **Type:** Bodoni Moda (display) + Inter (UI), self-hosted variable woff2
  subsets in `assets/fonts/`, loaded with `next/font/local` from `lib/fonts.ts`
  (~92 kB total, preloaded, metric-adjusted fallbacks).
- **Tokens:** warm paper/ink palette, 1 px rules, fluid display scale with
  `clamp()`, maximum 3 weights.
- **Layout:** 12-column editorial grid; the catalog alternates 7/5 and 5/7
  cards instead of a uniform three-up grid.
- **Motion:** CSS plus `Reveal` (`IntersectionObserver`); only `transform` and
  `opacity`. `prefers-reduced-motion: reduce` disables every non-essential
  animation and leaves all content visible, and so does disabled JavaScript.

## Known technical debt

See [`docs/AUDITORIA_TECNICA.md`](docs/AUDITORIA_TECNICA.md). Next up:

- Product photos are 512×512 sources: enough for cards, too small for
  full-bleed images on desktop (they bleed only on mobile and tablet).
- Metadata is a basic title and description; the full Metadata API, sitemap
  and Open Graph arrive in Phase 5.
- No automated tests and no CI yet (Phase 6).

## License

Private project. All rights reserved.
