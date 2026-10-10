# DARUMIX Qanoon Pharma adapter

This Worker is a server-side adapter for the Qanoon Pharma REST API described in
**Qanoon API REST Guide v2.0**. It does not put vendor credentials in frontend code.

## Important deployment safety

- This configuration points to the **test** server only.
- The guide specifies HTTP for the test base URL, not HTTPS. Do not send real customer
  information or switch to production until Qanoon confirms a secure connection path
  (HTTPS or an approved private/VPN route).
- Never commit credentials or tokens. Add Worker secrets using Wrangler or the Cloudflare
  dashboard:
  - `QANOON_USERNAME`
  - `QANOON_PASSWORD`
- Set `QANOON_USER_ID` and `QANOON_WAREHOUSE_ID` only after inspecting the actual
  `GET /settings` response. Do not guess IDs.
- This adapter does not implement a bank gateway. `POST /api/qanoon/sell` records the
  settlement operation in Qanoon after a payment provider has independently confirmed
  payment. Do not call it merely because the user clicked Pay.
- There is no durable local order/idempotency database in this first adapter. A caller
  must persist order state and reuse the exact same `uniqueId` when retrying the same
  create/sell operation. Add database-backed idempotency before live checkout.

## Configure secrets

From the `worker` directory:

```sh
npx wrangler secret put QANOON_USERNAME
npx wrangler secret put QANOON_PASSWORD
```

Then deploy to a test Worker only after reviewing the HTTP transport concern:

```sh
npx wrangler deploy
```

## Routes

- `GET /api/qanoon/health` — configuration presence only; does not authenticate.
- `GET /api/qanoon/settings` — Qanoon users, warehouses, tags and bank accounts.
- `GET /api/qanoon/products?tag=<comma-separated-ids>&goodType=pharma|nonPharma`
- `GET /api/qanoon/stock?warehouse=<id>` and/or `?good=<id>`
- `POST /api/qanoon/prescriptions` — creates Qanoon sales document; request fields:
  `uniqueId`, `goods[]` with `qanoonGoodId` (or `_id`), `sellPrice`,
  `sellQuantity`, optional `expirationDate`; optional customer fields.
- `DELETE /api/qanoon/prescriptions` — JSON body `{ "prescription": "<Qanoon _id>" }`.
- `POST /api/qanoon/sell` — records Qanoon settlement; JSON body includes
  `uniqueId`, `prescription`, `bankAccount`, optional `discount`.

All successful upstream JSON responses are passed through. Errors are returned in a
sanitized Persian response; credentials and tokens are never returned.

## Known gaps before production

1. Confirm whether the upstream expects `Authorization: Bearer <token>` or raw
   `Authorization: <token>`; the guide says the token is in the Authorization header
   but does not explicitly document the scheme.
2. Confirm availability and pricing calls with the test account.
3. Add persistent database records, stock revalidation during checkout, and idempotency.
4. Integrate the frontend service layer and map Qanoon goods IDs to storefront product IDs.
5. Implement and verify the actual payment gateway callback/Ack workflow.
6. Confirm image/product description source and safe product publication rules.
7. Do not expose purchase-cost field `cost` from stock results to public storefronts.
