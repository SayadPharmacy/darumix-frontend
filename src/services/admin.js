/**
 * DARUMIX — admin service.
 *
 * Aggregates the seeded records into the KPIs and chart series the admin
 * dashboard renders, and exposes the mutation helpers for product / category /
 * brand management. The charts are plain arrays of numbers so the SVG
 * components stay dumb and reusable.
 */

import { slices, commit, resetAll } from "../core/store.js";
import { seeds } from "../data/seeds.js";
import {
  seedCustomers,
  seedOrders,
  seedPrescriptions,
  seedConsultations,
  seedCampaigns,
  orderStatusCounts,
  SEGMENT_LABELS,
} from "../data/seed-records.js";
import { categoryById } from "../data/categories.js";
import { brandById } from "../data/brands.js";
import * as catalog from "./catalog.js";
import * as blog from "./blog.js";
import { invalidateBounds } from "./catalog.js";

/* ---------------------------------------------------------------------------
   Admin overlay writes
   --------------------------------------------------------------------------- */

function overrides() {
  return slices.catalogOverrides.get() || {};
}

function write(next) {
  slices.catalogOverrides.set(next);
  invalidateBounds();
  commit("catalogOverrides");
}

/** Patch a fixture record (product, category or brand). */
function patchRecord(kind, id, patch) {
  const current = overrides();
  const isAdded = (current.added?.[kind] || []).some(
    (record) => record.id === id,
  );

  const next = isAdded
    ? {
        ...current,
        added: {
          ...(current.added || {}),
          [kind]: (current.added[kind] || []).map((record) =>
            record.id === id ? { ...record, ...patch } : record,
          ),
        },
      }
    : {
        ...current,
        [kind]: {
          ...(current[kind] || {}),
          [id]: { ...(current[kind]?.[id] || {}), ...patch },
        },
      };

  write(next);
}

function addRecord(kind, record) {
  const current = overrides();
  write({
    ...current,
    added: {
      ...(current.added || {}),
      [kind]: [record, ...(current.added?.[kind] || [])],
    },
  });
}

function deleteRecord(kind, id) {
  const current = overrides();
  write({
    ...current,
    added: {
      ...(current.added || {}),
      [kind]: (current.added?.[kind] || []).filter((r) => r.id !== id),
    },
    deleted: {
      ...(current.deleted || {}),
      [kind]: [...new Set([...(current.deleted?.[kind] || []), id])],
    },
  });
}

/* ---------------------------------------------------------------------------
   Products
   --------------------------------------------------------------------------- */

export function saveProduct(payload) {
  if (payload.id) {
    patchRecord("products", payload.id, payload);
    return catalog.getProductById(payload.id);
  }

  const created = {
    id: `p-${Date.now().toString(36)}`,
    slug: payload.slug || `product-${Date.now().toString(36)}`,
    name: payload.name || "محصول بدون نام",
    brandId: payload.brandId || "darumix",
    categoryId: payload.categoryId || "otc",
    subcategoryId: payload.subcategoryId || "",
    price: Number(payload.price) || 0,
    compareAt: Number(payload.compareAt) || null,
    rating: Number(payload.rating) || 4.5,
    reviewCount: Number(payload.reviewCount) || 0,
    stock: Number(payload.stock) || 0,
    shortDescription: payload.shortDescription || "",
    description: payload.description || "",
    specs: payload.specs || [],
    variants: payload.variants?.length ? payload.variants : ["بسته استاندارد"],
    tags: payload.tags || [],
    shape: payload.shape || "tablet",
    tone: payload.tone || "emerald",
    rx: Boolean(payload.rx),
    featured: Boolean(payload.featured),
  };

  addRecord("products", created);
  return catalog.getProductById(created.id);
}

export function deleteProduct(id) {
  deleteRecord("products", id);
}

/** Fast inline edits from the product table. */
export function updateProductField(id, field, value) {
  if (field === "price" || field === "stock" || field === "compareAt") {
    patchRecord("products", id, { [field]: Number(value) || 0 });
  } else {
    patchRecord("products", id, { [field]: value });
  }
}

/** Bulk stock / price adjustments. */
export function bulkUpdate(ids, patch) {
  ids.forEach((id) => patchRecord("products", id, patch));
}

/* ---------------------------------------------------------------------------
   Categories & brands
   --------------------------------------------------------------------------- */

export function saveCategory(payload) {
  if (payload.id) {
    patchRecord("categories", payload.id, payload);
    return catalog.getCategoryById(payload.id);
  }

  const created = {
    id: `cat-${Date.now().toString(36)}`,
    group: payload.group || "medicine",
    title: payload.title || "دسته‌بندی جدید",
    icon: payload.icon || "pill",
    description: payload.description || "",
    subcategories: payload.subcategories || [],
  };

  addRecord("categories", created);
  return created;
}

export function deleteCategory(id) {
  deleteRecord("categories", id);
}

export function saveBrand(payload) {
  if (payload.id) {
    patchRecord("brands", payload.id, payload);
    return catalog.getBrandById(payload.id);
  }

  const created = {
    id: `brand-${Date.now().toString(36)}`,
    name: payload.name || "برند جدید",
    nameEn: payload.nameEn || "New Brand",
    tone: payload.tone || "emerald",
    featured: Boolean(payload.featured),
    country: payload.country || "ایران",
  };

  addRecord("brands", created);
  return created;
}

export function deleteBrand(id) {
  deleteRecord("brands", id);
}

/* ---------------------------------------------------------------------------
   Orders
   --------------------------------------------------------------------------- */

let orderOverrides = {};

/** All orders, with any admin status edits applied. */
export function orders() {
  return seedOrders.map((order) =>
    orderOverrides[order.id]
      ? { ...order, ...orderOverrides[order.id] }
      : order,
  );
}

export function orderById(id) {
  return orders().find((order) => order.id === id) || null;
}

export function setOrderStatus(id, status) {
  orderOverrides = {
    ...orderOverrides,
    [id]: { status, updatedAt: new Date().toISOString() },
  };
  commit("orders");
  return orderById(id);
}

/** Filter + paginate orders for the management table. */
export function filterOrders({
  status = "all",
  q = "",
  page = 1,
  perPage = 12,
} = {}) {
  const needle = String(q).trim().toLowerCase();

  let matched = orders();

  if (status && status !== "all") {
    matched = matched.filter((order) => order.status === status);
  }

  if (needle) {
    matched = matched.filter((order) =>
      [order.id, order.customerName, order.city, order.customerPhone]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }

  const total = matched.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * perPage;

  return {
    items: matched.slice(start, start + perPage),
    total,
    page: safePage,
    pages,
    perPage,
  };
}

/* ---------------------------------------------------------------------------
   Customers
   --------------------------------------------------------------------------- */

export function customers({
  segment = "all",
  q = "",
  page = 1,
  perPage = 12,
} = {}) {
  const needle = String(q).trim().toLowerCase();

  let matched = seedCustomers;

  if (segment && segment !== "all") {
    matched = matched.filter((customer) => customer.segment === segment);
  }

  if (needle) {
    matched = matched.filter((customer) =>
      [customer.name, customer.phone, customer.city, customer.email]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }

  const total = matched.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * perPage;

  return {
    items: matched.slice(start, start + perPage),
    total,
    page: safePage,
    pages,
    perPage,
  };
}

export function customerById(id) {
  return seedCustomers.find((customer) => customer.id === id) || null;
}

/** Orders belonging to one customer. */
export function ordersOfCustomer(customerId) {
  return orders().filter((order) => order.customerId === customerId);
}

export function customerSegments() {
  return Object.entries(SEGMENT_LABELS).map(([id, label]) => ({
    id,
    label,
    count: seedCustomers.filter((customer) => customer.segment === id).length,
  }));
}

/* ---------------------------------------------------------------------------
   Prescriptions (admin view)
   --------------------------------------------------------------------------- */

export function prescriptions({ status = "all", q = "" } = {}) {
  const needle = String(q).trim().toLowerCase();

  let matched = seedPrescriptions;

  if (status && status !== "all") {
    matched = matched.filter((item) => item.status === status);
  }

  if (needle) {
    matched = matched.filter((item) =>
      [item.id, item.customerName, item.doctorName]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }

  return matched;
}

export function consultations({ status = "all" } = {}) {
  if (!status || status === "all") return seedConsultations;
  return seedConsultations.filter((item) => item.status === status);
}

/* ---------------------------------------------------------------------------
   Analytics
   --------------------------------------------------------------------------- */

/** Revenue + order counts, bucketed into the given number of recent days. */
export function revenueSeries(days = 14) {
  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - index));
    date.setHours(0, 0, 0, 0);
    return { date, revenue: 0, orders: 0 };
  });

  orders().forEach((order) => {
    if (order.status === "cancelled" || order.status === "returned") return;

    const placed = new Date(order.placedAt);
    placed.setHours(0, 0, 0, 0);
    const bucket = buckets.find(
      (entry) => entry.date.getTime() === placed.getTime(),
    );
    if (bucket) {
      bucket.revenue += order.total;
      bucket.orders += 1;
    }
  });

  return buckets;
}

/** Revenue per weekday (Saturday → Friday), for the weekly pattern chart. */
export function weekdaySeries() {
  const labels = [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
  ];
  const totals = new Array(7).fill(0);

  orders().forEach((order) => {
    const day = new Date(order.placedAt).getDay(); // 0 = Sunday
    const index = day === 6 ? 0 : day + 1; // shift so Saturday is first
    totals[index] += order.total;
  });

  return labels.map((label, index) => ({ label, value: totals[index] }));
}

/** Revenue split by category. */
export function categoryMix() {
  const map = new Map();

  orders().forEach((order) => {
    order.items.forEach((item) => {
      const product = catalog.getProductById(item.productId);
      const categoryId = product?.categoryId || "other";
      const current = map.get(categoryId) || {
        categoryId,
        revenue: 0,
        units: 0,
      };
      current.revenue += item.lineTotal;
      current.units += item.quantity;
      map.set(categoryId, current);
    });
  });

  const total =
    [...map.values()].reduce((sum, entry) => sum + entry.revenue, 0) || 1;

  return [...map.values()]
    .map((entry) => ({
      ...entry,
      title: categoryById.get(entry.categoryId)?.title || "سایر",
      percent: Math.round((entry.revenue / total) * 100),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);
}

/** Traffic sources shown as a bar list. */
export function trafficSources() {
  const sources = [
    { label: "جستجوی گوگل", share: 0.34, icon: "search" },
    { label: "ورود مستقیم", share: 0.22, icon: "globe" },
    { label: "شبکه‌های اجتماعی", share: 0.19, icon: "share" },
    { label: "کمپین ایمیلی", share: 0.14, icon: "mail" },
    { label: "معرفی دوستان", share: 0.11, icon: "users" },
  ];

  const totalVisits = seeds.int("traffic-total", 42000, 68000);

  return sources.map((source) => ({
    ...source,
    visits: Math.round(totalVisits * source.share),
    percent: Math.round(source.share * 100),
  }));
}

/** Headline KPI numbers for the dashboard. */
export function overview() {
  const list = orders();
  const paid = list.filter(
    (order) => order.status !== "cancelled" && order.status !== "returned",
  );

  const revenue = paid.reduce((total, order) => total + order.total, 0);
  const previousRevenue = Math.round(revenue * 0.87);
  const averageOrder = paid.length ? Math.round(revenue / paid.length) : 0;

  const inventory = catalog.inventoryStats();
  const rxStats = {
    total: seedPrescriptions.length,
    pending: seedPrescriptions.filter(
      (item) => item.status === "submitted" || item.status === "in-review",
    ).length,
  };

  return {
    revenue,
    revenueChange: previousRevenue
      ? Math.round(((revenue - previousRevenue) / previousRevenue) * 100)
      : 0,
    orders: list.length,
    ordersChange: 12,
    averageOrder,
    averageOrderChange: 5,
    customers: seedCustomers.length,
    customersChange: 8,
    prescriptions: rxStats,
    consultations: seedConsultations.length,
    statusCounts: orderStatusCounts(list),
    inventory,
    products: inventory.total,
    lowStock: inventory.lowStock.length,
    outOfStock: inventory.outOfStock.length,
    articles: blog.contentStats().total,
    conversionRate: 3.8,
    conversionChange: 0.4,
    returnRate: 2.1,
    satisfactionScore: 4.6,
  };
}

/** Everything the analytics page needs, in one call. */
export function analytics() {
  const list = orders();

  return {
    revenue: revenueSeries(14),
    weekday: weekdaySeries(),
    mix: categoryMix(),
    traffic: trafficSources(),
    top: catalog.topProducts(list, 6),
    statusCounts: orderStatusCounts(list),
    inventory: catalog.inventoryStats(),
    segments: customerSegments(),
  };
}

/* ---------------------------------------------------------------------------
   Marketing
   --------------------------------------------------------------------------- */

export function campaigns() {
  return seedCampaigns.map((campaign) => ({
    ...campaign,
    openRate: campaign.sent
      ? Math.round((campaign.opened / campaign.sent) * 100)
      : 0,
    clickRate: campaign.sent
      ? Math.round((campaign.clicked / campaign.sent) * 100)
      : 0,
    conversionRate: campaign.sent
      ? Math.round((campaign.converted / campaign.sent) * 100)
      : 0,
  }));
}

export function marketingOverview() {
  const list = campaigns();
  const sent = list.reduce((total, campaign) => total + campaign.sent, 0);
  const converted = list.reduce(
    (total, campaign) => total + campaign.converted,
    0,
  );
  const budget = list.reduce((total, campaign) => total + campaign.budget, 0);

  return {
    campaigns: list.length,
    active: list.filter((campaign) => campaign.status === "active").length,
    sent,
    converted,
    openRate: sent
      ? Math.round((list.reduce((t, c) => t + c.opened, 0) / sent) * 100)
      : 0,
    clickRate: sent
      ? Math.round((list.reduce((t, c) => t + c.clicked, 0) / sent) * 100)
      : 0,
    conversionRate: sent ? Math.round((converted / sent) * 100) : 0,
    budget,
    cpa: converted ? Math.round(budget / converted) : 0,
  };
}

/* ---------------------------------------------------------------------------
   Demo data control
   --------------------------------------------------------------------------- */

/** Wipe every admin edit and every locally stored record. */
export function resetDemoData() {
  orderOverrides = {};
  resetAll();
  invalidateBounds();
}

/** Whether the admin has pending edits to the catalog. */
export function hasPendingEdits() {
  const current = overrides();
  return Boolean(
    Object.keys(current).length &&
    (Object.keys(current.products || {}).length ||
      Object.keys(current.categories || {}).length ||
      Object.keys(current.brands || {}).length ||
      (current.added?.products || []).length ||
      (current.deleted?.products || []).length),
  );
}

export { SEGMENT_LABELS, brandById };

export default {
  saveProduct,
  deleteProduct,
  updateProductField,
  bulkUpdate,
  saveCategory,
  deleteCategory,
  saveBrand,
  deleteBrand,
  orders,
  orderById,
  setOrderStatus,
  filterOrders,
  customers,
  customerById,
  ordersOfCustomer,
  customerSegments,
  prescriptions,
  consultations,
  revenueSeries,
  weekdaySeries,
  categoryMix,
  trafficSources,
  overview,
  analytics,
  campaigns,
  marketingOverview,
  resetDemoData,
  hasPendingEdits,
  SEGMENT_LABELS,
};
