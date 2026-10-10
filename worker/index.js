/**
 * DARUMIX -> Qanoon Pharma REST adapter (Cloudflare Worker).
 *
 * Required Worker secrets:
 *   QANOON_USERNAME
 *   QANOON_PASSWORD
 * Required Worker vars:
 *   QANOON_BASE_URL = http://test.qanoonpharma.com:2999 (test only)
 *   QANOON_WAREHOUSE_ID = value selected from GET /settings
 *   QANOON_USER_ID = value selected from GET /settings
 *
 * Never expose these credentials to the browser or commit them to Git.
 */
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
let tokenCache = { token: "", expiresAt: 0 };

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
function fail(status, code, message, details) {
  return json({ success: false, error: { code, message, ...(details ? { details } : {}) } }, status);
}
function requiredEnv(env, name) {
  const value = env[name];
  if (!value || !String(value).trim()) throw new Error(`Missing Worker configuration: ${name}`);
  return String(value).trim();
}
function upstreamBase(env) {
  const raw = requiredEnv(env, "QANOON_BASE_URL").replace(/\/+$/, "");
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("QANOON_BASE_URL must use HTTP(S)");
  return raw;
}
async function getToken(env, force = false) {
  const now = Date.now();
  if (!force && tokenCache.token && tokenCache.expiresAt > now + 60_000) return tokenCache.token;
  const base = upstreamBase(env);
  const username = requiredEnv(env, "QANOON_USERNAME");
  const password = requiredEnv(env, "QANOON_PASSWORD");
  const response = await fetch(`${base}/auth/token`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ username, password }),
    signal: AbortSignal.timeout(12_000)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.token) {
    tokenCache = { token: "", expiresAt: 0 };
    throw Object.assign(new Error("Qanoon authentication failed"), { upstreamStatus: response.status });
  }
  tokenCache = { token: payload.token, expiresAt: now + 23 * 60 * 60 * 1000 };
  return tokenCache.token;
}
async function qanoon(env, path, options = {}, retryAuth = true) {
  const base = upstreamBase(env);
  const token = await getToken(env);
  const headers = new Headers(options.headers || {});
  headers.set("authorization", `Bearer ${token}`);
  headers.set("accept", "application/json");
  if (options.body !== undefined) headers.set("content-type", "application/json");
  const response = await fetch(`${base}${path}`, {
    ...options, headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: AbortSignal.timeout(15_000)
  });
  if (response.status === 401 && retryAuth) {
    tokenCache = { token: "", expiresAt: 0 };
    return qanoon(env, path, options, false);
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw Object.assign(new Error("Qanoon request failed"), { upstreamStatus: response.status, upstreamBody: payload });
  }
  if (payload?.success === false) {
    throw Object.assign(new Error("Qanoon reported an unsuccessful operation"), { upstreamStatus: 502, upstreamBody: payload });
  }
  return payload;
}
function safeError(error) {
  if (error?.name === "TimeoutError" || error?.name === "AbortError") return fail(504, "QANOON_TIMEOUT", "پاسخی از سرور قانون فارما در زمان مقرر دریافت نشد.");
  if (error?.upstreamStatus === 401) return fail(502, "QANOON_AUTH_FAILED", "احراز هویت با سرور قانون فارما ناموفق بود.");
  if (error?.upstreamStatus) return fail(502, "QANOON_UPSTREAM_ERROR", "سرور قانون فارما درخواست را نپذیرفت.", { upstreamStatus: error.upstreamStatus });
  const message = String(error?.message || "");
  if (message.startsWith("Missing Worker configuration:")) return fail(503, "CONFIGURATION_REQUIRED", "تنظیمات اتصال سرور قانون فارما کامل نشده است.");
  return fail(502, "QANOON_UNAVAILABLE", "اتصال به سرور قانون فارما برقرار نشد.");
}
function queryValue(url, key) { return (url.searchParams.get(key) || "").trim(); }
function isInternal(request, env) {
  const expected = env.DARUMIX_INTERNAL_API_KEY;
  const supplied = request.headers.get("x-darumix-internal-key");
  return Boolean(expected && supplied && supplied === expected);
}
function positiveInt(value, fallback = 1) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}
async function handle(request, env) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: {
      "access-control-allow-origin": env.ALLOWED_ORIGIN || url.origin,
      "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,authorization",
      "access-control-max-age": "86400"
    }});
  }
  if (!url.pathname.startsWith("/api/qanoon/")) return fail(404, "NOT_FOUND", "مسیر پیدا نشد.");
  try {
    if (url.pathname === "/api/qanoon/health" && request.method === "GET") {
      return json({ success: true, configured: Boolean(env.QANOON_BASE_URL && env.QANOON_USERNAME && env.QANOON_PASSWORD), mode: env.QANOON_MODE || "test" });
    }
    if (url.pathname === "/api/qanoon/settings" && request.method === "GET") {
      if (!isInternal(request, env)) return fail(401, "UNAUTHORIZED", "دسترسی مجاز نیست.");
      return json(await qanoon(env, "/settings"));
    }
    if (url.pathname === "/api/qanoon/products" && request.method === "GET") {
      const tag = queryValue(url, "tag");
      const goodType = queryValue(url, "goodType");
      if (goodType && !["pharma", "nonPharma"].includes(goodType)) return fail(400, "INVALID_GOOD_TYPE", "goodType فقط می‌تواند pharma یا nonPharma باشد.");
      const params = new URLSearchParams();
      if (tag) params.set("tag", tag);
      if (goodType) params.set("goodType", goodType);
      const suffix = params.size ? `?${params.toString()}` : "";
      return json(await qanoon(env, `/goods${suffix}`));
    }
    if (url.pathname === "/api/qanoon/stock" && request.method === "GET") {
      const warehouse = queryValue(url, "warehouse");
      const good = queryValue(url, "good");
      if (!warehouse && !good) return fail(400, "STOCK_FILTER_REQUIRED", "برای جلوگیری از دریافت کل انبار، warehouse یا good را مشخص کنید.");
      const params = new URLSearchParams();
      if (warehouse) params.set("warehouse", warehouse);
      if (good) params.set("good", good);
      const payload = await qanoon(env, `/goods/stock?${params.toString()}`);
      // Never expose supplier purchase-cost information to storefront clients.
      if (payload?.data?.goodStocks && Array.isArray(payload.data.goodStocks)) {
        payload.data.goodStocks = payload.data.goodStocks.map(({ cost, ...publicFields }) => publicFields);
      }
      return json(payload);
    }
    if (url.pathname === "/api/qanoon/prescriptions" && request.method === "POST") {
      const input = await request.json();
      const user = requiredEnv(env, "QANOON_USER_ID");
      if (!Array.isArray(input.goods) || input.goods.length === 0) return fail(400, "EMPTY_GOODS", "سبد خرید خالی است.");
      const goods = input.goods.map((item) => ({
        _id: String(item.qanoonGoodId || item._id || ""),
        sellPrice: Number(item.sellPrice),
        sellQuantity: positiveInt(item.sellQuantity),
        ...(item.expirationDate ? { expirationDate: String(item.expirationDate) } : {})
      }));
      if (goods.some((item) => !item._id || !Number.isFinite(item.sellPrice) || item.sellPrice < 0)) {
        return fail(400, "INVALID_GOODS", "شناسه، قیمت یا تعداد یکی از کالاها معتبر نیست.");
      }
      const uniqueId = String(input.uniqueId || "").trim();
      if (!uniqueId || uniqueId.length > 100) return fail(400, "UNIQUE_ID_REQUIRED", "شناسه یکتای سفارش الزامی است.");
      const body = {
        user, goods,
        nationalId: String(input.nationalId || ""),
        name: String(input.name || ""),
        family: String(input.family || ""),
        phone: String(input.phone || ""),
        birthDate: String(input.birthDate || ""),
        discount: Math.max(0, Number(input.discount) || 0),
        uniqueId
      };
      return json(await qanoon(env, "/prescription", { method: "POST", body }), 201);
    }
    if (url.pathname === "/api/qanoon/prescriptions" && request.method === "DELETE") {
      const input = await request.json();
      if (!input.prescription) return fail(400, "PRESCRIPTION_REQUIRED", "شناسه سند فروش الزامی است.");
      return json(await qanoon(env, "/prescription", { method: "DELETE", body: {
        user: requiredEnv(env, "QANOON_USER_ID"),
        prescription: String(input.prescription)
      }}));
    }
    if (url.pathname === "/api/qanoon/sell" && request.method === "POST") {
      const input = await request.json();
      const uniqueId = String(input.uniqueId || "").trim();
      if (!uniqueId || !input.prescription || !input.bankAccount) return fail(400, "PAYMENT_FIELDS_REQUIRED", "شناسه یکتا، سند فروش و حساب بانکی الزامی است.");
      return json(await qanoon(env, "/sell/prescription", { method: "POST", body: {
        user: requiredEnv(env, "QANOON_USER_ID"),
        prescription: String(input.prescription),
        bankAccount: String(input.bankAccount),
        discount: Math.max(0, Number(input.discount) || 0),
        uniqueId
      }}));
    }
    return fail(404, "NOT_FOUND", "مسیر پیدا نشد.");
  } catch (error) {
    return safeError(error);
  }
}
export default {
  async fetch(request, env) {
    const response = await handle(request, env);
    const origin = request.headers.get("origin");
    const allowed = env.ALLOWED_ORIGIN;
    const headers = new Headers(response.headers);
    if (origin && allowed && origin === allowed) {
      headers.set("access-control-allow-origin", allowed);
      headers.set("vary", "Origin");
    }
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
};
