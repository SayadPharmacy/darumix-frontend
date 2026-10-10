# DARUMIX — Production readiness audit

**Audit date:** 2026-10-10  
**Repository:** `SayadPharmacy/darumix-frontend`  
**Scope:** source and project documentation available in the repository. This is a code-level audit, not a live deployment or penetration test.

## Current verified state

The repository is a Vite + vanilla JavaScript frontend intended for static hosting. Its README explicitly states that it has no backend, database, API, authentication server, or payment gateway and that the data is mock/localStorage data. Therefore, the current repository must **not** be represented as a live transactional pharmacy store.

The current UI contains storefront, account, prescription-request, consultation, magazine, and admin-dashboard screens. Presence of a screen does not mean its operation is persisted centrally or protected server-side.

## Production blockers (P0)

- **Identity and authorization:** browser-side/local state cannot safely authenticate customers or protect admin routes. Implement server-side sessions, password hashing, rate limits, account recovery, and server-side role checks. Never rely on hidden UI routes as authorization.
- **Product and inventory source of truth:** move products, prices, stock, brands, categories, and availability to a database-backed API. Validate all price/stock values server-side at checkout.
- **Orders and checkout:** persist orders transactionally on the server; calculate totals and shipping server-side; implement idempotency, order status transitions, cancellation/refund handling, and audit logs.
- **Payment:** integrate a selected, licensed payment provider through server-created payment intents/requests and verified server-to-server callbacks. Never trust a browser success redirect as proof of payment. Provider credentials must remain server secrets.
- **Shipping:** configure the actual carrier/provider and serviceable areas, fees, tracking, and status updates. Do not show a shipment as booked unless the provider confirms it.
- **Prescription uploads and health information:** upload actual files to private storage using short-lived authorized URLs or an authenticated upload endpoint; validate content, size, ownership, and access on the server; prevent public indexing; define retention and deletion policy. Do not keep prescription metadata or patient details only in localStorage.
- **Privacy and security:** define privacy/consent and retention practices; use HTTPS, secure cookies, CSRF protection where applicable, input validation, output escaping, request limits, and security headers. Health-related submissions require particularly careful access control.
- **Admin actions:** all privileged mutations must be API-authorized and audited; browser-only admin state is not sufficient.
- **AI assistant:** if enabled, use a server-side provider adapter, secret management, rate limiting, safety boundaries, and clear disclaimers. Never allow an AI response to diagnose, prescribe, or replace pharmacist/doctor review. A “learning” feature must not train on identifiable patient information without a lawful, explicit process.

## P1 — required before public launch

- Real transactional email/SMS/OTP provider and delivery-status handling.
- Real contact/branch data, shipping rules, policies, refund terms, and support workflow.
- Replace fictional product/customer/order/review/article and analytics fixtures with verified content. Clearly label editorial and commercial information.
- SEO metadata, sitemap/robots, canonical URLs, analytics consent where required, accessibility, mobile and cross-browser checks.
- Automated unit/integration/e2e tests covering registration, login/logout, admin authorization, product changes, cart totals, checkout, payment callbacks, prescription access, and order state transitions.
- Backup/restore plan, monitoring, error reporting, database migrations, incident response, and production environment separation.

## Integration contracts to implement

Keep the existing UI, but make the backend the authority. Recommended initial endpoints (exact routes may be adapted to the existing API):

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/session`
- `GET /api/catalog/products`, `GET /api/catalog/products/:id`, `GET /api/catalog/categories`, `GET /api/catalog/brands`
- `POST /api/orders/quote`, `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`
- `POST /api/payments/initialize`, `POST /api/payments/callback` (provider-specific signature verification required)
- `POST /api/prescriptions/upload-intent`, `POST /api/prescriptions`, `GET /api/prescriptions` (ownership checks required)
- `GET/POST/PATCH/DELETE /api/admin/*` (server-side admin role required)

Do not assume these routes exist until the backend is inspected and their behavior is tested.

## Release gates

A production release is blocked until all of the following are true:

1. A real backend and database are identified and deployed.
2. Customer and admin authentication/authorization pass automated tests.
3. Checkout totals are server-calculated and payment callbacks are verified.
4. Prescription files are private, authorized, and stored outside browser localStorage.
5. Shipping, notifications, and order status use real provider/API responses.
6. Mock data is removed from production paths.
7. Build, smoke, security, accessibility, and end-to-end tests pass.
8. A staging deployment is verified before any production deployment.

## Important limitation

This document records blockers; it does not claim they have been implemented. A real backend URL, its API contract/access, database/storage configuration, payment provider credentials, and shipping-provider configuration are necessary to complete and verify those integrations. Secrets must be supplied through the deployment platform's secret manager, never committed to Git.
