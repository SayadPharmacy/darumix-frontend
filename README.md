# DARUMIX — Persian pharmacy & health e-commerce frontend

**دارومیکس** — a complete, production-ready **frontend-only** pharmacy & healthcare
e-commerce experience, built around a **Liquid Glass / Glassmorphism** design system.

> No backend. No database. No API. No auth server. No payment gateway.
> All data is mock/local and persisted in `localStorage`. Every "server" concern is
> isolated behind a service layer so a real API can be plugged in later without
> rebuilding the UI. The whole app compiles to static files and deploys directly
> on **Cloudflare Pages**.

---

## Tech stack

| Concern    | Choice                                                                             |
| ---------- | ---------------------------------------------------------------------------------- |
| Build tool | [Vite 4](https://vitejs.dev) (`base: './'`, static output in `dist/`)              |
| UI layer   | Vanilla ES modules + template-string components (zero framework runtime)           |
| Routing    | `HashRouter` (hash routing → perfect for static hosting, no redirect rules needed) |
| State      | Tiny observable store with `localStorage` persistence                              |
| Styling    | Hand-written CSS — design tokens, glass utilities, RTL-first, mobile-first         |
| Fonts      | Vazirmatn with system/local fallback (no external request required)                |
| Icons      | Inline hand-made SVG sprite (`src/ui/icons.js`) — no icon dependency               |
| Data       | Mock catalog, orders, prescriptions, articles… in `src/data/`                      |

**Runtime dependencies: 0.** `vite` is the only dev dependency.

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/
npm run preview    # serve the production build locally
```

> If `node`/`npm` are not on your `PATH` (common on some Windows setups), call them
> by full path, e.g. `& "C:\Program Files\nodejs\npm.cmd" run dev`.

### Deploying on Cloudflare Pages

| Setting                | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Framework preset       | `Vite`                                         |
| Build command          | `npm run build`                                |
| Build output directory | `dist`                                         |
| Node version           | 18 or 20 (`NODE_VERSION=18` env var if needed) |

`public/_headers` already ships long-lived cache headers for hashed assets.
Because routing is hash-based, **no SPA redirect rules are required**.

---

## Architecture

```
UI (pages + components)
   ↓  dispatch intents
State (@core/store.js — observable + localStorage)
   ↓  read / write
Services (@services/*.js)  ← the ONLY place that knows where data comes from
   ↓
Mock data (@data/*.js)  →  [ future: REST/Fetch API ]
```

Swapping mock data for a real backend means rewriting only `src/services/*`:
every page talks to services, never to the raw fixtures.

Deeper notes: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

```
index.html
public/
  _headers            # Cloudflare Pages cache headers
  favicon.svg
src/
  main.js             # app bootstrap + route table
  styles/
    tokens.css        # colors, radii, shadows, glass variables, themes
    base.css          # reset, typography (RTL/Vazirmatn), a11y primitives
    layout.css        # shell, header, footer, grid systems, drawers
    components.css    # buttons, cards, inputs, badges, tables, modal, toast…
    pages.css         # page-specific composition
  core/               # router, store, events, format, dom, seo, cf
  services/           # catalog, cart, orders, prescriptions, blog, admin…
  data/               # mock catalog, categories, brands, articles, seed orders…
  ui/
    icons.js          # SVG sprite
    components/       # header, footer, product card, drawer, modal, toast, …
  pages/              # storefront routes
  pages/admin/        # admin dashboard routes
docs/ARCHITECTURE.md
```

No temporary, duplicate or generated files are kept in the repo — `dist/` and
`node_modules/` are ignored.

---

## Feature map

### Storefront

- **Homepage** — hero, service guarantees, category rail, popular products, brands,
  health magazine teaser, newsletter, marketing banners.
- **Catalog** — search, category/brand/price/rating filters, sort, grid/list view,
  pagination, skeletons, empty & error states, URL-synced filter state.
- **Categories** — category grid + subcategory drill-down.
- **Product detail** — gallery, variants, pricing/discount, specs, reviews with rating
  breakdown, related products, add-to-cart / wishlist / compare.
- **Cart** — drawer + full page, quantity control, coupon codes, free-shipping meter.
- **Checkout** — 4-step glass wizard (address → shipping → payment → review) with a
  local order summary and success state.
- **Prescription request** — upload UI, medication list, pharmacist callback flow.
- **Pharmacist consultation** — booking UI, time slots, consultation history.
- **Account** — profile, addresses, orders, prescription status, settings.
- **Wishlist / Compare (up to 4) / Recently viewed / Notifications / Reviews**.
- **Health magazine** — article list, tag filtering, article detail.
- **FAQ (accordion), Contact & location (branches + map placeholder), About**.
- **Persian RTL UI**, search overlay, mobile nav drawer, toasts, modals.

### Admin dashboard (`#/admin`)

- KPI overview + SVG analytics (revenue trend, category mix, traffic bars).
- Product management (search, price/stock editing, add-edit modal, delete).
- Category & brand management.
- Order management (status pipeline, detail drawer).
- Customer management (segment filter, detail).
- Prescription management (approve → ready → delivered pipeline).
- Content management (articles, create/edit modal).
- Marketing (campaigns, coupons, newsletter segments).

### UX / quality

- Fully Persian and **RTL** (`dir="rtl"`), Vazirmatn typography.
- Mobile-first responsive: 360px → ultrawide, tested breakpoints at 480/768/1024/1280.
- Accessible: skip link, focus-visible rings, ARIA roles/labels, keyboard-closable
  drawers & modals, `aria-live` toasts, `prefers-reduced-motion` support.
- Loading skeletons, empty states, error states and success states on every surface.
- Guarded against horizontal overflow (long Persian strings wrap, tables scroll).

---

## Demo data notice

All products, brands, prices, customers, orders, prescriptions, articles and
statistics are **fictional mock data** created for this frontend demo. Nothing is
medically or commercially authoritative, and no real user data is collected or sent
anywhere.
