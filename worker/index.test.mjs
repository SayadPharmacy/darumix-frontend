import test from "node:test";
import assert from "node:assert/strict";
import worker from "./index.js";

const originalFetch = globalThis.fetch;
const baseEnv = {
  QANOON_BASE_URL: "https://qanoon.test.invalid",
  QANOON_USERNAME: "test-user",
  QANOON_PASSWORD: "test-password",
  DARUMIX_INTERNAL_API_KEY: "internal-test-key",
  QANOON_USER_ID: "test-user-id",
  QANOON_MODE: "test",
};

function req(path, { method = "GET", headers = {}, body } = {}) {
  return new Request(`https://adapter.test${path}`, {
    method,
    headers: { ...(body !== undefined ? { "content-type": "application/json" } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test("health reports test mode without exposing secrets", async () => {
  const response = await worker.fetch(req("/api/qanoon/health"), baseEnv);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.mode, "test");
  assert.equal(JSON.stringify(body).includes("test-password"), false);
});

test("settings route denies requests without the internal key", async () => {
  const response = await worker.fetch(req("/api/qanoon/settings"), baseEnv);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error.code, "UNAUTHORIZED");
});

test("stock route requires a good or warehouse filter", async () => {
  const response = await worker.fetch(req("/api/qanoon/stock"), baseEnv);
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "STOCK_FILTER_REQUIRED");
});

test("products route authenticates and forwards the supported filter", async (t) => {
  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    if (url.endsWith("/auth/token")) {
      assert.equal(init.method, "POST");
      return new Response(JSON.stringify({ token: "unit-test-token" }), { status: 200 });
    }
    assert.equal(url, "https://qanoon.test.invalid/goods?goodType=nonPharma");
    assert.equal(new Headers(init.headers).get("authorization"), "Bearer unit-test-token");
    return new Response(JSON.stringify({ success: true, data: { goods: [] } }), { status: 200 });
  };
  t.after(() => { globalThis.fetch = originalFetch; });
  const response = await worker.fetch(req("/api/qanoon/products?goodType=nonPharma"), baseEnv);
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).data.goods, []);
});

test("privileged write routes deny requests without the internal key", async () => {
  const response = await worker.fetch(req("/api/qanoon/prescriptions", {
    method: "POST",
    body: { uniqueId: "unit-test", goods: [{ qanoonGoodId: "item", sellPrice: 100, sellQuantity: 1 }] },
  }), baseEnv);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error.code, "UNAUTHORIZED");
});
