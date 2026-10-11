/**
 * Public browser-side reads for the DARUMIX Qanoon adapter.
 *
 * Never put Qanoon credentials or DARUMIX_INTERNAL_API_KEY in this module.
 * Qanoon product IDs are retained as qanoonGoodId; they must not be confused
 * with local storefront IDs until a persistent mapping is implemented.
 */
const API_ROOT = (import.meta.env.VITE_QANOON_API_BASE || "/api/qanoon").replace(/\/+$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    method: "GET",
    headers: { accept: "application/json", ...(options.headers || {}) },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.error?.message || "دریافت اطلاعات از قانون فارما ناموفق بود.");
    error.status = response.status;
    error.code = payload?.error?.code || "QANOON_REQUEST_FAILED";
    throw error;
  }
  return payload;
}

export async function getQanoonProducts({ tag = "", goodType = "nonPharma" } = {}) {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (goodType) params.set("goodType", goodType);
  const suffix = params.size ? `?${params.toString()}` : "";
  const payload = await request(`/products${suffix}`);
  const goods = payload?.data?.goods;
  if (!Array.isArray(goods)) throw new Error("ساختار پاسخ محصولات قانون فارما قابل شناسایی نیست.");
  return goods.map((good) => ({
    qanoonGoodId: String(good._id || ""),
    qanoonCode: String(good.virtualCodeNumeric || ""),
    title: String(good.combinedTitlePersian || good.titlePersian || ""),
    titleEnglish: String(good.combinedTitleEnglish || good.titleEnglish || ""),
    brand: String(good.titleBrandPersian || good.titleBrandEnglish || ""),
    price: Number(good.sellPrice) || 0,
    barcode: Array.isArray(good.barcodes) ? good.barcodes.map(String) : [],
    ircCodes: Array.isArray(good.ircCodes) ? good.ircCodes.map(String) : [],
    tags: Array.isArray(good.tags) ? good.tags.map(String) : [],
    goodType: String(good.goodType || good.GoodType || ""),
    active: good.isActive === true,
    raw: good,
  }));
}

export async function getQanoonStock({ warehouse = "", good = "" } = {}) {
  const params = new URLSearchParams();
  if (warehouse) params.set("warehouse", warehouse);
  if (good) params.set("good", good);
  if (!params.size) throw new Error("برای دریافت موجودی، شناسه کالا یا انبار الزامی است.");
  const payload = await request(`/stock?${params.toString()}`);
  const stocks = payload?.data?.goodStocks;
  if (!Array.isArray(stocks)) throw new Error("ساختار پاسخ موجودی قانون فارما قابل شناسایی نیست.");
  return stocks.map((row) => ({
    qanoonGoodId: String(row.good || ""),
    warehouseId: String(row.warehouse || ""),
    stock: Number(row.stock) || 0,
    sellPrice: Number(row.sellPrice) || 0,
    expirationDate: String(row.expirationDate || ""),
    available: Number(row.stock) > 0,
  }));
}

export default { getQanoonProducts, getQanoonStock };
