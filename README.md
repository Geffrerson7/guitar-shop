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

| Layer     | Technology                                                   |
| --------- | ------------------------------------------------------------ |
| Framework | Next.js 16 (App Router, Turbopack)                           |
| Language  | TypeScript 6 (`strict`, no explicit `any`)                   |
| UI        | React 19 — Server Components by default                      |
| Styling   | Tailwind CSS 4 (via `@tailwindcss/postcss`)                  |
| Linting   | ESLint 10 flat config with `eslint-config-next` (+ TS rules) |
| Format    | Prettier 3 (`eslint-config-prettier`), LF line endings       |
| Testing   | Vitest + Testing Library (unit), Playwright + axe (e2e)      |
| CI        | GitHub Actions (`.github/workflows/ci.yml`)                  |
| Hosting   | Vercel for now — no platform-only APIs (see below)           |

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

### Environment variables

Copy `.env.example` to `.env.local` when you need them. None is required for
local development.

| Variable   | Purpose                                                                                                                                                                                                                                                                                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SITE_URL` | Public URL of the site, without trailing slash. Used for canonical URLs, Open Graph, `sitemap.xml`, `robots.txt` and JSON-LD. Falls back to `VERCEL_PROJECT_PRODUCTION_URL` and then to `http://localhost:3000`. Set it **at build time and at runtime**: static pages read it during the build, dynamic responses (such as a product 404) at request time. |

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start the Next.js dev server                 |
| `pnpm build`        | Production build into `.next/`               |
| `pnpm start`        | Serve the production build (any Node server) |
| `pnpm lint`         | Run ESLint over the whole project            |
| `pnpm typecheck`    | Generate route types and run `tsc --noEmit`  |
| `pnpm format`       | Format the project with Prettier             |
| `pnpm format:check` | Check formatting without writing (CI)        |
| `pnpm test`         | Run the Vitest unit tests once               |
| `pnpm test:watch`   | Run Vitest in watch mode                     |
| `pnpm test:e2e`     | Run Playwright against the production build  |

## Testing

| Layer         | Tool                                        | What it covers                                                                                               | Where                              |
| ------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| Unit          | Vitest + Testing Library (jsdom)            | Utilities, data layer, site URL, SEO metadata, JSON-LD, client components, `GuitarCard`                      | `**/*.test.ts(x)` next to the code |
| End to end    | Playwright (desktop and mobile Chrome)      | Catalog, product 200/404, unknown route 404, no-JS rendering, reduced motion, `robots.txt` and `sitemap.xml` | `e2e/smoke.spec.ts`                |
| Accessibility | axe (`@axe-core/playwright`), WCAG 2.2 A/AA | The 6 public routes; fails on any serious or critical violation                                              | `e2e/a11y.spec.ts`                 |

Async Server Components (the pages) are covered end to end, because Vitest
cannot render them. Playwright runs against `next start`, not the dev server:

```bash
pnpm exec playwright install chromium   # once
pnpm build && pnpm test:e2e
```

Purely decorative text (`aria-hidden`, exempt from contrast under WCAG 1.4.3)
is marked with `data-decorativo` and skipped by the axe audit.

Every later phase adds its own tests; they are not left for the end.

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`:

1. `pnpm install --frozen-lockfile`
2. `pnpm format:check`
3. `pnpm lint`
4. `pnpm typecheck`
5. `pnpm test`
6. `pnpm build`
7. `pnpm test:e2e` (Chromium cached by Playwright version)

On failure, the Playwright report and traces are uploaded as an artifact. The
workflow pins pnpm `12.18.0` because `package.json` does not declare
`packageManager`; keep both aligned.

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
│   ├── robots.ts            # /robots.txt
│   ├── sitemap.ts           # /sitemap.xml (built from the data layer)
│   ├── icon.svg             # Favicon
│   ├── apple-icon.png       # Home screen icon (180×180)
│   └── globals.css          # Tailwind entry, tokens and motion
├── assets/                  # Files imported by code (hashed and optimized at build)
│   ├── fonts/               # Self-hosted woff2 subsets (Bodoni Moda + Inter)
│   ├── guitarras/           # Product images (WebP sources, 512×512)
│   └── og/                  # Share image for Open Graph and Twitter (1200×630)
├── components/              # Shared components
│   └── ui/                  # Container, Button, PageTitle and shared styles
├── data/                    # Local product data (only read by lib/)
├── hooks/                   # Client hooks (useReveal)
├── lib/                     # Data access (getGuitarras…), fonts, site URL, SEO helpers
├── types/                   # Domain types (Guitarra, Categoria)
├── utils/                   # Pure helpers (formatPrice, staggerStyle)
├── e2e/                     # Playwright end-to-end and axe tests
├── .github/workflows/       # CI
├── docs/
│   ├── AUDITORIA_TECNICA.md # Technical audit and improvement roadmap
│   └── DIRECCION_DE_ARTE.md # Art direction and design system
├── eslint.config.mjs
├── next.config.ts
├── playwright.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── vitest.config.mts
```

## Routes

| Path             | Rendering                    | Notes                                 |
| ---------------- | ---------------------------- | ------------------------------------- |
| `/`              | Static                       |                                       |
| `/catalogo`      | Static                       |                                       |
| `/producto/[id]` | SSG (`generateStaticParams`) | Unknown or invalid id → real HTTP 404 |
| `/acerca`        | Static                       |                                       |
| `/contacto`      | Static                       |                                       |
| anything else    | `not-found.tsx`              | HTTP 404                              |

Routes are resolved on the server, so deep links and reloads work without any
hosting rewrite.

## Server / client boundary

Every component is a **Server Component** unless it needs state, effects or
browser APIs. Only these files declare `"use client"`:

| File                    | Why                                        |
| ----------------------- | ------------------------------------------ |
| `components/Header.tsx` | Active link via `usePathname`              |
| `components/Reveal.tsx` | Reveal on scroll (`IntersectionObserver`)  |
| `hooks/useReveal.ts`    | Hook used by `Reveal`                      |
| `app/error.tsx`         | Error boundaries must be Client Components |
| `app/global-error.tsx`  | Same, for the root layout                  |

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
  `app/globals.css` (`paper`, `ink`, `accent`, fluid type scale). On dark
  `ink` backgrounds use `accent-light`: `accent` does not reach 3:1 there.
- **Formatting:** Prettier decides; run `pnpm format` before committing. Line
  endings are LF everywhere (`.gitattributes`), Windows included.
- **Cards and links:** a link's accessible name must come from visible text
  (WCAG 2.5.3). Clickable cards put the link on the title and stretch it with a
  pseudo-element instead of wrapping the whole card.
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

## SEO and metadata

- **Metadata API:** the root layout sets `metadataBase`, a default title and
  the `%s — Voltio & Madera` template, `theme-color`, and Open Graph / Twitter
  defaults. Each page calls `pageMetadata()` from `lib/seo.ts` for its title,
  description and canonical URL; the product detail uses `generateMetadata`.
- **Share image:** `assets/og/voltio-y-madera.jpg` (1200×630) is passed
  explicitly by `pageMetadata()`. The `opengraph-image` file convention is not
  used because a page that declares its own `openGraph` replaces the whole
  object and drops the file-based image.
- **Crawling:** `app/robots.ts` and `app/sitemap.ts`. The sitemap reads from
  `getGuitarras()`, so it follows the catalog when it moves to the database.
  `/admin`, `/carrito`, `/checkout` and `/pedido` are disallowed ahead of the
  phases that create them. 404 responses get `noindex` from Next.js.
- **Structured data:** schema.org `Product` JSON-LD on each product page
  (`lib/structured-data.ts`), with `availability: InStoreOnly` until there is
  online checkout. `<` is escaped so content cannot close the script tag.
- **Icons:** `app/icon.svg` and `app/apple-icon.png` (file conventions).

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
- Product pages share the site-wide preview image instead of one per product.
- Branch protection (require green CI before merging) is a repository
  setting, not code; it has to be enabled on GitHub.

## License

Private project. All rights reserved.
