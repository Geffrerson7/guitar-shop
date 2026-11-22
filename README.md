# GUITAR-SHOP

A boutique guitar storefront built with Next.js (App Router) and TypeScript.
It has a catalog with search and filters, a product detail view, a persistent
guest cart, a simulated checkout that records orders, and the usual static
pages (home, about, contact, privacy, 404). The storefront brand is **Voltio & Madera**.

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
| Database  | PostgreSQL 18 + Prisma 7 (`@prisma/adapter-pg`)              |
| Env vars  | Validated with Zod at startup (`env.ts`)                     |
| Linting   | ESLint 10 flat config with `eslint-config-next` (+ TS rules) |
| Format    | Prettier 3 (`eslint-config-prettier`), LF line endings       |
| Testing   | Vitest + Testing Library (unit), Playwright + axe (e2e)      |
| CI        | GitHub Actions (`.github/workflows/ci.yml`)                  |
| Hosting   | Vercel for now — no platform-only APIs (see below)           |

## Requirements

- Node.js `>=22.12.0` (see `.nvmrc`)
- pnpm `>=10` — **this project uses pnpm**; `package-lock.json` and `yarn.lock`
  are git-ignored on purpose
- Docker (for the local PostgreSQL in `docker-compose.yml`)

## Getting started

```bash
cp .env.example .env    # DATABASE_URL points to the Docker database
pnpm install            # also runs `prisma generate`
pnpm db:up              # docker compose up -d --wait (PostgreSQL 18)
pnpm db:migrate         # prisma migrate dev: applies prisma/migrations
pnpm db:seed            # 12 products and 4 categories (idempotent)
pnpm dev
```

The dev server runs on `http://localhost:3000`. `pnpm build` also needs the
database: the catalog and product pages are prerendered from it.

### Environment variables

`env.ts` validates them with Zod and is imported by `next.config.ts`, so
`next dev` and `next build` stop at startup, naming the variable, if a required
one is missing or malformed. Copy `.env.example` to `.env` (git-ignored); the
Prisma CLI reads `.env` too.

| Variable       | Purpose                                                                                                                                                                                                                                                                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | **Required.** PostgreSQL URL used by the running app. Locally, the Docker database. On Neon, the **pooled** string (`-pooler` host): serverless functions open many short connections.                                                                                                                                                                      |
| `DIRECT_URL`   | Optional. Direct (non-pooled) Neon string for `prisma migrate`. When unset, migrations use `DATABASE_URL`.                                                                                                                                                                                                                                                  |
| `SITE_URL`     | Public URL of the site, without trailing slash. Used for canonical URLs, Open Graph, `sitemap.xml`, `robots.txt` and JSON-LD. Falls back to `VERCEL_PROJECT_PRODUCTION_URL` and then to `http://localhost:3000`. Set it **at build time and at runtime**: static pages read it during the build, dynamic responses (such as a product 404) at request time. |

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
| `pnpm db:up`        | Start the local PostgreSQL (Docker Compose)  |
| `pnpm db:migrate`   | Create/apply migrations in development       |
| `pnpm db:deploy`    | Apply pending migrations (CI, production)    |
| `pnpm db:seed`      | Load the catalog (idempotent upsert)         |
| `pnpm db:studio`    | Open Prisma Studio                           |

## Testing

| Layer         | Tool                                        | What it covers                                                                                                                                        | Where                              |
| ------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Unit          | Vitest + Testing Library (jsdom)            | Utilities, env validation, data layer (Prisma mocked), site URL, SEO, JSON-LD, client components                                                      | `**/*.test.ts(x)` next to the code |
| Integration   | Vitest against PostgreSQL                   | Data layer on the seeded database: products, unknown id, inactive product, categories, catalog search (accents, filters, pagination, order)           | `lib/guitarras.db.test.ts`         |
| Integration   | Vitest against PostgreSQL                   | Order transaction: copied prices, stock decrement, insufficient stock and inactive products roll back, last unit raced by two orders, idempotency key | `lib/pedidos.db.test.ts`           |
| End to end    | Playwright (desktop and mobile Chrome)      | Catalog, product 200/404, unknown route 404, no-JS rendering, reduced motion, `robots.txt` and `sitemap.xml`                                          | `e2e/smoke.spec.ts`                |
| End to end    | Playwright                                  | Catalog search, filters, order, pagination, Back button, shareable URLs, invalid params, no-JS form, footer links                                     | `e2e/catalogo.spec.ts`             |
| End to end    | Playwright                                  | Cart: add from the detail, change, remove, stock limit, reload, reopen the browser, second tab, tampered `localStorage`, `/api/carrito`               | `e2e/carrito.spec.ts`              |
| End to end    | Playwright                                  | Checkout: catalog → cart → checkout → confirmation by keyboard, field errors and focus, tampered price and stock, double submit, noindex, 404         | `e2e/checkout.spec.ts`             |
| Accessibility | axe (`@axe-core/playwright`), WCAG 2.2 A/AA | The public routes plus filtered, paginated and empty catalog states; fails on any serious or critical violation                                       | `e2e/a11y.spec.ts`                 |

The integration tests need `DATABASE_URL` (from `.env` or the environment) and
a seeded database; they are skipped when it is not set. Their auxiliary rows
use a unique suffix and are deleted afterwards. They live in their own Vitest
project (`db`) that runs one file at a time: the order tests create active
products for a moment, which the catalog tests would otherwise count.

The checkout E2E tests read and clean the database through `pg` (`e2e/db.ts`):
each test uses its own email, and afterwards the stock of its orders is given
back and the orders are deleted. Each Playwright project buys a different
product that no other test uses (desktop: id 10, mobile: id 9), and the tests
in that file run in order, so stock assertions are exact. Each test also sends
its own `x-forwarded-for` so the checkout rate limit does not trip.

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

1. `pnpm install --frozen-lockfile` (runs `prisma generate`)
2. `pnpm db:deploy` and `pnpm db:seed` against a `postgres:18-alpine` service
3. `pnpm format:check`
4. `pnpm lint`
5. `pnpm typecheck`
6. `pnpm test`
7. `pnpm build`
8. `pnpm test:e2e` (Chromium cached by Playwright version)

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
│   ├── carrito/             # /carrito (noindex)
│   ├── api/carrito/         # GET /api/carrito?ids= — live product data for the cart
│   ├── checkout/            # /checkout (noindex) + actions.ts (Server Action)
│   ├── pedido/[codigo]/     # /pedido/:codigo — order confirmation (noindex, dynamic)
│   ├── privacidad/          # /privacidad — privacy notice
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
│   └── og/                  # Share image for Open Graph and Twitter (1200×630)
├── components/              # Shared components
│   ├── carrito/             # Add-to-cart button, cart page view
│   ├── checkout/            # Checkout form and order summary
│   └── ui/                  # Container, Button, PageTitle and shared styles
├── features/carrito/        # Cart: reducer, localStorage format, store, provider, totals
├── features/checkout/       # Form ↔ Server Action contract (fields, result states)
├── generated/prisma/        # Prisma Client (git-ignored, `prisma generate`)
├── hooks/                   # Client hooks (useReveal)
├── lib/                     # Data access (getGuitarras…, pedidos), Prisma client, validators, fonts, site URL, SEO
├── prisma/
│   ├── schema.prisma        # Categoria, Producto, Pedido and PedidoItem models
│   ├── migrations/          # Versioned SQL migrations
│   └── seed.ts              # Idempotent catalog seed
├── public/guitarras/        # Product images (WebP, 512×512); the DB stores the path
├── types/                   # Domain types (Guitarra, Categoria)
├── utils/                   # Pure helpers (formatPrice, staggerStyle)
├── e2e/                     # Playwright end-to-end and axe tests
├── .github/workflows/       # CI
├── docs/
│   ├── AUDITORIA_TECNICA.md # Technical audit and improvement roadmap
│   └── DIRECCION_DE_ARTE.md # Art direction and design system
├── docker-compose.yml       # Local PostgreSQL
├── env.ts                   # Environment validation (Zod)
├── eslint.config.mjs
├── next.config.ts
├── playwright.config.ts
├── postcss.config.mjs
├── prisma.config.ts         # Prisma CLI: schema, migrations, seed, datasource URL
├── tsconfig.json
└── vitest.config.mts
```

## Routes

| Path               | Rendering                             | Notes                                                                                     |
| ------------------ | ------------------------------------- | ----------------------------------------------------------------------------------------- |
| `/`                | Static (regenerated by tag)           |                                                                                           |
| `/catalogo`        | Dynamic (`searchParams`), cached data | Search, filters, order and pagination in the URL; invalid params are ignored, never a 500 |     |
| `/producto/[id]`   | SSG (`generateStaticParams`)          | Unknown, invalid or inactive id → real HTTP 404; new ids render on demand                 |
| `/carrito`         | Static shell, client content          | Content comes from `localStorage` + `GET /api/carrito`; `noindex`                         |
| `/api/carrito`     | Dynamic Route Handler, `no-store`     | `?ids=1,3` → current name, price, image and stock of active products; invalid ids → 400   |
| `/checkout`        | Static shell, client form             | Posts to the `confirmarPedido` Server Action; `noindex`                                   |
| `/pedido/[codigo]` | Dynamic (`connection()`)              | Order confirmation; unknown or malformed code → 404; `noindex`, `no-referrer`             |
| `/privacidad`      | Static                                | Privacy notice linked from the checkout consent                                           |
| `/acerca`          | Static                                |                                                                                           |
| `/contacto`        | Static                                |                                                                                           |
| anything else      | `not-found.tsx`                       | HTTP 404                                                                                  |

Routes are resolved on the server, so deep links and reloads work without any
hosting rewrite.

## Server / client boundary

Every component is a **Server Component** unless it needs state, effects or
browser APIs. Only these files declare `"use client"`:

| File                                         | Why                                                    |
| -------------------------------------------- | ------------------------------------------------------ |
| `components/Header.tsx`                      | Active link via `usePathname`, cart counter            |
| `features/carrito/CarritoProvider.tsx`       | Cart state (`useSyncExternalStore`) and live region    |
| `components/carrito/AnadirAlCarrito.tsx`     | Add-to-cart button with stock limit                    |
| `components/carrito/CarritoVista.tsx`        | Cart lines, quantities and totals                      |
| `features/carrito/useProductosCarrito.ts`    | Fetches live product data for cart and checkout        |
| `components/checkout/FormularioCheckout.tsx` | Checkout form (`useActionState`), summary, focus       |
| `components/Reveal.tsx`                      | Reveal on scroll (`IntersectionObserver`)              |
| `hooks/useReveal.ts`                         | Hook used by `Reveal`                                  |
| `components/LinkSpinner.tsx`                 | Pending-navigation spinner (`useLinkStatus`)           |
| `components/catalogo/NavegacionCatalogo.tsx` | Shared navigation transition for filters and results   |
| `components/catalogo/FiltrosCatalogo.tsx`    | Writes the filters to the URL (debounce, push/replace) |
| `app/error.tsx`                              | Error boundaries must be Client Components             |
| `app/global-error.tsx`                       | Same, for the root layout                              |

The brand ticker is pure CSS and stays on the server. Pages read data through
`lib/guitarras.ts`, which (like `lib/prisma.ts`) imports `server-only`: a
Client Component that imported it would fail the build, so no database query
can run in the browser.

## Data and caching

- **Source of truth:** PostgreSQL. Models `Categoria` and `Producto` in
  `prisma/schema.prisma`; prices are integer cents (`precioCentimos`), never
  floats or `Decimal`.
- **Client:** one `PrismaClient` with the `pg` driver adapter
  (`lib/prisma.ts`), kept on `globalThis` in development so HMR does not open a
  new pool on every change.
- **Reads:** `getGuitarras()`, `getGuitarraById()` and `getCategorias()` return
  only active products, as plain serializable objects (`types/guitarra.ts`).
- **Cache:** each read goes through `unstable_cache` with tags and no
  time-based expiry. Pages are prerendered at build time and regenerate when a
  mutation calls `revalidateTag(tag, "max")`. Tags (`cacheTags` in
  `lib/guitarras.ts`): `productos` (lists and every detail), `producto:<id>`
  (one detail), `categorias`. The admin CRUD (Phase 13) is the first caller.
  `'use cache'` was not used because it requires `cacheComponents`, which
  changes rendering app-wide.
- **Loading states:** `app/producto/[id]/loading.tsx` covers products rendered
  on demand. Links to the catalog wrap their text in `LinkSpinner`, which shows
  a spinner while the navigation is pending (only visible when the prefetch has
  not finished). The catalog has no `loading.tsx` on purpose: a Suspense boundary around a
  database query makes the prerendered HTML ship the skeleton and swap the
  cards in with a script, which leaves the page empty without JavaScript.
- **Catalog search (Phase 9):** the state lives in the URL
  (`?q=&categoria=&marca=&precioMin=&precioMax=&orden=&pagina=`, prices in
  whole euros). `lib/validaciones/catalogo.ts` parses it with Zod and drops
  anything invalid; `lib/catalogo-consulta.ts` turns it into Prisma arguments
  (pure, unit tested); `buscarGuitarras()` runs it, 8 products per page,
  cached per combination under the `productos` tag. Text search matches name
  or brand, every word, ignoring case and accents through PostgreSQL
  `unaccent` (a migration enables the extension; Prisma has no equivalent).
  `lib/catalogo-url.ts` holds the types and URL helpers without Zod so the
  filters' client bundle stays small.
- **Filters UI:** a plain `GET` form with `role="search"`: without JavaScript
  it submits and the server filters. With JavaScript it only updates the URL
  inside a transition: selects push a history entry (Back undoes a filter),
  text and prices are debounced and replace it. Inputs are uncontrolled, so
  typing never waits for the network. The result count is an `aria-live`
  region. The canonical URL is always `/catalogo`, without parameters.
- **Cart (Phase 10):** guest checkout, so the cart lives in the browser
  (`localStorage`, key `voltio-madera:carrito:v1`) and stores **only
  `productoId` and `cantidad`**. Everything read back is sanitized
  (`features/carrito/almacenamiento.ts`): corrupt JSON, another version,
  invalid ids or quantities and injected fields are dropped. State changes go
  through a pure reducer (`features/carrito/reducer.ts`) applied by an
  external store read with `useSyncExternalStore`: the server snapshot is the
  empty cart, so hydration never mismatches, and the `storage` event keeps tabs
  in sync. Names, prices, images and stock always come from
  `GET /api/carrito` (uncached); totals are computed from that response
  (`features/carrito/calculo.ts`), never from browser data. Unavailable
  products and lines above the current stock are flagged and left out of the
  total without blocking the rest. One `role="status"` region in the provider
  announces every change. The product detail reads `stock` with the cached
  detail; the cart re-checks it live, and checkout checks it again inside the
  order transaction.
- **Checkout and orders (Phase 11):** `/checkout` posts the cart (ids and
  quantities only) and the contact data to the `confirmarPedido` Server Action
  (`app/checkout/actions.ts`). Zod validates everything again on the server
  (`lib/validaciones/checkout.ts`; the browser only gets `autocomplete`, input
  types and `required`). `crearPedido` (`lib/pedidos.ts`) runs one transaction:
  `SELECT … FOR UPDATE` of the products in id order, a pure check of stock and
  `activo` plus the total from database prices (`lib/pedidos-calculo.ts`), the
  stock decrement and the order with its lines (name, brand and unit price are
  **copied**). Any failing line rolls everything back and is reported to the
  user. A CHECK constraint keeps `stock >= 0`. Double submits are stopped twice:
  the form ignores submissions while one is pending, and every attempt carries
  an idempotency key (UUID, unique in `Pedido`) so a repeat returns the same
  order. The action is rate limited per IP (5 valid submissions per 10 minutes,
  in memory). After a new order it calls `updateTag("producto:<id>")` so the
  detail shows the new stock right away. The public order code is 80 random
  bits (`VM-XXXX-XXXX-XXXX-XXXX`, Crockford alphabet), not sequential. With the
  simulated payment, orders are created `confirmado`; states are `pendiente`,
  `confirmado`, `enviado` and `cancelado` (managed from the panel in Phase
  13). Only name, email, optional phone and shipping address are collected,
  with explicit consent; nothing is sent to third parties.
- **URLs:** `/producto/[id]` stays (the Phase 6 smoke tests pin it). Every
  product already has a unique `slug`, ready for a later move to
  `/producto/[slug]` with permanent redirects.

## Conventions

- **Language:** domain in Spanish (`Guitarra`, `Categoria`, `precioCentimos`, route
  segments such as `catalogo` or `producto`), infrastructure and tooling in
  English (`getGuitarras`, `formatPrice`, `staggerStyle`, `Container`). UI copy
  is always Spanish.
- **Components:** one component per file, default export, `PascalCase` filename.
- **Folders:** no `src/` directory. `app/` holds routing only (pages, layouts,
  error and not-found files); shared code lives in sibling top-level folders
  (`components/`, `lib/`, `prisma/`, `types/`, `hooks/`, `utils/`).
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
- **Prices:** integer cents everywhere; displayed only through `formatPrice`
  (takes cents, `es-ES`, EUR) — never `toLocaleString()` in components.
- **Data access:** async, server-only functions in `lib/` (`getGuitarras`,
  `getGuitarraById`, `getCategorias`). Pages never import Prisma.

## Hosting

Vercel is the current choice and gives preview deployments per pull request.
It is provisional, so the app avoids platform-only APIs: `pnpm build` +
`pnpm start` runs it on any Node server.

Managed PostgreSQL is **Neon**: set `DATABASE_URL` to the pooled connection
string and `DIRECT_URL` to the direct one, then run `pnpm db:deploy` (and
`pnpm db:seed` on a fresh database). Local development never needs Neon.

## Images

Product images go through `components/ProductImage.tsx`, a thin wrapper over
`next/image` (`fill` + `sizes`). The database stores a path under
`public/guitarras/` (today) or, later, a remote URL (Cloudinary, Phase 13), so
pages do not change when the source does.

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
  `/admin`, `/carrito`, `/checkout`, `/pedido` and `/api/` are disallowed;
  `/carrito`, `/checkout` and `/pedido/[codigo]` also send `noindex`. 404 responses get `noindex` from Next.js.
- **Structured data:** schema.org `Product` JSON-LD on each product page
  (`lib/structured-data.ts`), with `availability` `InStock` or `OutOfStock`
  from the detail's stock (`InStoreOnly` when the stock is unknown). `<` is escaped so content cannot close the script tag.
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
- The checkout rate limit lives in memory, per server instance: exact on one
  Node process, per-instance on serverless. A shared limit (database or Redis)
  is for Phase 14.
- Neon's region (AWS Europe, Frankfurt) is named in the privacy notice; the
  project has to be created there (Phase 14).
- Branch protection (require green CI before merging) is a repository
  setting, not code; it has to be enabled on GitHub.

## License

Private project. All rights reserved.
