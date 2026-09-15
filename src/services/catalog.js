/**
 * DARUMIX — catalog service.
 *
 * THE single source of catalog data for the whole app. Pages never import
 * `data/products.js` directly; they call these functions. Replacing mock data
 * with a REST API means rewriting the bodies below and nothing else.
 *
 * Every function is synchronous today. To move to a network layer later, the
 * callers already await their results (`await catalogService.list(...)`), so
 * converting these to `async` requires no page changes.
 */

import { products as baseProducts } from "../data/products.js";
import {
  categories as baseCategories,
  categoryById as baseCategoryById,
  categoryGroups,
  subcategories,
  subcategoryById,
} from "../data/categories.js";
import { brands as baseBrands, brandById as baseBrandById } from "../data/brands.js";
import { normalizePersian, discountPercent } from "../core/format.js";
import { slices, storeEvents } from "../core/store.js";

// Aliased so the memoised `buildCache()` below can shadow the fixture bindings
// with its merged view without the two names colliding.
const categories_ = baseCategories;
const brands_ = baseBrands;

/* ---------------------------------------------------------------------------
   Admin overrides
   --------------------------------------------------------------------------- */

/**
 * The admin dashboard edits products, categories and brands. Those edits are
 * kept as a sparse overlay in localStorage rather than mutating the fixtures,
 * so "reset demo data" is instant and the base dataset stays immutable.
 */
function overrides() {
  return slices.catalogOverrides.get() || {};
}

function overlay(kind, record, source = overrides()) {
  const patch = source[kind]?.[record.id];
  return patch ? { ...record, ...patch } : record;
}


/* ---------------------------------------------------------------------------
   Memoisation
   `allProducts()` merges the fixtures with the admin overlay and then DECORATES
   every record (brand name, category title, discount, stock flags). That is the
   most expensive operation in the app, and it used to run from scratch on every
   single call — the catalog page alone triggered it ~20 times per keystroke, and
   every product card did its own lookup for brand and category.

   The inputs only change when a slice is committed (`commit('catalogOverrides')`
   from the admin service, or `resetAll()`), so the result is cached until then.
   The cache below is the only memo in this module; the exported helpers are thin
   wrappers over it so no call site can capture a stale snapshot.
   --------------------------------------------------------------------------- */

let cache = null;

function buildCache() {
  const overridesNow = overrides();
  const removedProducts = new Set(overridesNow.deleted?.products || []);
  const removedCategories = new Set(overridesNow.deleted?.categories || []);
  const removedBrands = new Set(overridesNow.deleted?.brands || []);

  const products = [...(overridesNow.added?.products || []), ...baseProducts]
    .filter((product) => !removedProducts.has(product.id))
    .map((product) => overlay("products", product, overridesNow));

  const categories = [...(overridesNow.added?.categories || []), ...categories_]
    .filter((category) => !removedCategories.has(category.id))
    .map((category) => overlay("categories", category, overridesNow));

  const brands = [...(overridesNow.added?.brands || []), ...brands_]
    .filter((brand) => !removedBrands.has(brand.id))
    .map((brand) => overlay("brands", brand, overridesNow));

  return {
    overrides: overridesNow,
    products,
    categories,
    brands,
    productById: new Map(products.map((product) => [product.id, product])),
    brandById: new Map(brands.map((brand) => [brand.id, brand])),
    categoryById: new Map(categories.map((category) => [category.id, category])),
    countsByCategory: countBy(products, "categoryId"),
    countsByBrand: countBy(products, "brandId"),
    tags: allTagsOf(products),
    priceBounds: priceBoundsOf(products),
    // Filled by allProducts() right after the merged arrays exist.
    decorated: null,
    all: [],
    byId: new Map(),
    bySlug: new Map(),
  };
}

/** Invalidate every memo in this module. */
export function invalidateCatalog() {
  cache = null;
}

/** Kept for the existing admin import; the catalog cache supersedes it. */
export function invalidateBounds() {
  invalidateCatalog();
}

// The store is the only thing that can change the data: the admin service calls
// `commit('catalogOverrides')` after every edit and `resetAll()` commits after a
// reset, so subscribing here keeps the cache honest with no call-site changes.
storeEvents.on("change", ({ slices: changed } = {}) => {
  const names = changed || [];
  if (names.includes("catalogOverrides") || names.length === Object.keys(slices).length) {
    invalidateCatalog();
  }
});

/** Merged, decorated view of every product, including admin edits and additions. */
export function allProducts() {
  if (cache) return cache.decorated;

  cache = buildCache();

  // Decorate once, then index. Doing this in the build means every caller and
  // every later lookup shares one object per product instead of getting a copy.
  cache.decorated = cache.products.map((product) => decorate(product));

  const byId = new Map();
  const bySlug = new Map();

  cache.decorated.forEach((product) => {
    byId.set(product.id, product);
    if (product.slug) bySlug.set(product.slug, product);
  });

  cache.all = cache.decorated;
  cache.byId = byId;
  cache.bySlug = bySlug;

  return cache.decorated;
}

export function allCategories() {
  allProducts();
  return cache.categories;
}

export function allBrands() {
  allProducts();
  return cache.brands;
}

/** Tally how many records share each value of a key. */
function countBy(records, key) {
  const counts = new Map();
  records.forEach((record) => {
    const value = record[key];
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  return counts;
}

/** Distinct tags ordered by frequency, capped at `limit`. */
function allTagsOf(products, limit = 24) {
  const frequency = new Map();

  products.forEach((product) => {
    (product.tags || []).forEach((tag) =>
      frequency.set(tag, (frequency.get(tag) || 0) + 1),
    );
  });

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

function priceBoundsOf(products) {
  if (!products.length) return { min: 0, max: 5000000 };

  let min = Infinity;
  let max = -Infinity;

  products.forEach((product) => {
    if (product.price < min) min = product.price;
    if (product.price > max) max = product.price;
  });

  return {
    min: Math.floor(min / 10000) * 10000,
    max: Math.ceil(max / 10000) * 10000,
  };
}

/* ---------------------------------------------------------------------------
   Enrichment
   --------------------------------------------------------------------------- */

/** Attach brand and category display data so components need no extra lookups. */
export function decorate(product) {
  if (!product) return null;

  const brand =
    cache?.brandById.get(product.brandId) ||
    baseBrandById.get(product.brandId) ||
    allBrands().find((item) => item.id === product.brandId);
  const category =
    cache?.categoryById.get(product.categoryId) ||
    baseCategoryById.get(product.categoryId) ||
    allCategories().find((item) => item.id === product.categoryId);
  const sub = subcategoryById.get(product.subcategoryId);

  return {
    ...product,
    brandName: brand?.name || "دارومیکس",
    brandNameEn: brand?.nameEn || "Darumix",
    brandTone: brand?.tone || "emerald",
    categoryTitle: category?.title || "",
    subcategoryTitle: sub?.title || "",
    discount: discountPercent(product.price, product.compareAt),
    inStock: product.stock > 0,
    lowStock: product.stock > 0 && product.stock <= 12,
  };
}

/* ---------------------------------------------------------------------------
   Single product
   --------------------------------------------------------------------------- */

/**
 * Both lookups below resolve against the memoised catalog, so every product is
 * decorated exactly once. They used to build a fresh object on every call, which
 * the catalog page pays for once per rendered card (and once per card action).
 */
export function getProductById(id) {
  if (!id) return null;

  allProducts();
  return cache.byId.get(id) || null;
}

export function getProductBySlug(slug) {
  if (!slug) return null;

  allProducts();
  return cache.bySlug.get(slug) || null;
}

export function getCategoryById(id) {
  if (!id) return null;
  const base = baseCategoryById.get(id);
  if (base) return overlay("categories", base);
  return allCategories().find((category) => category.id === id) || null;
}

export function getBrandById(id) {
  if (!id) return null;
  const base = baseBrandById.get(id);
  if (base) return overlay("brands", base);
  return allBrands().find((brand) => brand.id === id) || null;
}

/* ---------------------------------------------------------------------------
   Filtering & sorting
   --------------------------------------------------------------------------- */

export const SORT_OPTIONS = [
  { id: "relevance", label: "مرتبط‌ترین" },
  { id: "newest", label: "جدیدترین" },
  { id: "price-asc", label: "ارزان‌ترین" },
  { id: "price-desc", label: "گران‌ترین" },
  { id: "rating", label: "بیشترین امتیاز" },
  { id: "popular", label: "پرطرفدارترین" },
  { id: "discount", label: "بیشترین تخفیف" },
];

/**
 * Min/max product price across the catalog.
 * Computed lazily and memoised, then invalidated whenever the admin overlay
 * changes — a module-level constant would freeze before the store is ready.
 */
export function priceBounds() {
  allProducts();
  return cache.priceBounds;
}

/** Parse a raw query object from the URL into a normalised filter object. */
export function parseFilters(query = {}) {
  const bounds = priceBounds();

  // Must treat "" as "absent": Number("") is 0, which would silently
  // collapse the price range to 0–0 and hide every product.
  const asNumber = (value, fallback) => {
    if (value == null) return fallback;

    const cleaned = String(value).replace(/[^\d.]/g, "");
    if (cleaned === "") return fallback;

    const num = Number(cleaned);
    return Number.isFinite(num) ? num : fallback;
  };

  const asList = (value) => {
    if (!value) return [];
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const q = String(query.q || "").trim();

  return {
    q,
    needle: normalizePersian(q),
    categories: asList(query.category),
    subcategories: asList(query.sub),
    brands: asList(query.brand),
    tags: asList(query.tag),
    minPrice: asNumber(query.min, bounds.min),
    maxPrice: asNumber(query.max, bounds.max),
    minRating: asNumber(query.rating, 0),
    inStockOnly: query.stock === "1" || query.stock === "true",
    onSaleOnly: query.sale === "1" || query.sale === "true",
    sort: SORT_OPTIONS.some((option) => option.id === query.sort)
      ? query.sort
      : "relevance",
    page: Math.max(1, asNumber(query.page, 1)),
    perPage: Math.min(48, Math.max(8, asNumber(query.perPage, 12))),
    view: query.view === "list" ? "list" : "grid",
  };
}

/** True when any filter differs from the default. */
export function hasActiveFilters(filters) {
  const bounds = priceBounds();

  return Boolean(
    filters.q ||
    filters.categories.length ||
    filters.subcategories.length ||
    filters.brands.length ||
    filters.tags.length ||
    filters.inStockOnly ||
    filters.onSaleOnly ||
    filters.minRating > 0 ||
    filters.minPrice > bounds.min ||
    filters.maxPrice < bounds.max,
  );
}

/* ---------------------------------------------------------------------------
   Search matching
   --------------------------------------------------------------------------- */

/**
 * Score a product against a query. Higher is better; 0 means no match.
 * Searches name, brand, category, tags and description so Persian users find
 * products whether they type the brand, the form or the indication.
 */
function scoreProduct(product, needle) {
  if (!needle) return 1;

  const name = normalizePersian(product.name);
  const brand = normalizePersian(product.brandName);
  const category = normalizePersian(product.categoryTitle);
  const sub = normalizePersian(product.subcategoryTitle);
  const tags = normalizePersian((product.tags || []).join(" "));
  const description = normalizePersian(product.description || "");

  let score = 0;

  if (name === needle) score += 120;
  if (name.startsWith(needle)) score += 70;
  if (name.includes(needle)) score += 45;
  if (brand === needle) score += 40;
  if (brand.includes(needle)) score += 22;
  if (sub.includes(needle)) score += 20;
  if (category.includes(needle)) score += 20;
  if (tags.includes(needle)) score += 16;
  if (description.includes(needle)) score += 6;

  // Partial word matches still help (e.g. "ویتامی" → "ویتامین").
  if (!score && needle.length >= 3) {
    const tokens = needle.split(" ").filter((token) => token.length >= 3);
    const haystack = `${name} ${brand} ${tags} ${category} ${sub}`;
    const hits = tokens.filter((token) => haystack.includes(token)).length;
    if (tokens.length && hits === tokens.length) score += 10;
  }

  return score;
}

/** Sort comparator for a resolved sort id. */
function compare(sort, a, b) {
  switch (sort) {
    case "price-asc":
      return a.price - b.price;
    case "price-desc":
      return b.price - a.price;
    case "rating":
      return b.rating - a.rating || b.reviewCount - a.reviewCount;
    case "popular":
      return b.reviewCount - a.reviewCount;
    case "discount":
      return b.discount - a.discount || a.price - b.price;
    case "newest":
      return b.id.localeCompare(a.id, undefined, { numeric: true });
    default:
      return b.rating - a.rating;
  }
}

/**
 * Query the catalog.
 * @returns {{items: any[], total: number, page: number, pages: number, perPage: number}}
 */
export function list(filters, source) {
  const pool = source || allProducts();

  // A query already carries the normalised needle from parseFilters; only a
  // hand-built filter object needs the (non-cheap) normalisation here.
  const needle = filters.needle || (filters.q ? normalizePersian(filters.q) : "");

  // Hoisted out of the predicate: no work per product when a filter is off.
  const categories = new Set(filters.categories);
  const subcategories = new Set(filters.subcategories);
  const brands = new Set(filters.brands);
  const tags = filters.tags;

  let matched = pool.filter((product) => {
    if (categories.size && !categories.has(product.categoryId)) return false;
    if (subcategories.size && !subcategories.has(product.subcategoryId))
      return false;
    if (brands.size && !brands.has(product.brandId)) return false;
    if (tags.length && !tags.some((tag) => (product.tags || []).includes(tag)))
      return false;
    if (product.price < filters.minPrice || product.price > filters.maxPrice)
      return false;
    if (filters.minRating && product.rating < filters.minRating) return false;
    if (filters.inStockOnly && product.stock <= 0) return false;
    if (filters.onSaleOnly && !product.discount) return false;
    return true;
  });

  if (needle) {
    matched = matched
      .map((product) => ({ product, score: scoreProduct(product, needle) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.product);
  } else {
    matched = [...matched].sort((a, b) => compare(filters.sort, a, b));
  }

  // A text query already ranks by relevance; an explicit sort overrides it.
  if (needle && filters.sort !== "relevance") {
    matched = [...matched].sort((a, b) => compare(filters.sort, a, b));
  }

  const total = matched.length;
  const pages = Math.max(1, Math.ceil(total / filters.perPage));
  const page = Math.min(filters.page, pages);
  const start = (page - 1) * filters.perPage;

  return {
    items: matched.slice(start, start + filters.perPage),
    total,
    page,
    pages,
    perPage: filters.perPage,
  };
}

/* ---------------------------------------------------------------------------
   Curated collections
   --------------------------------------------------------------------------- */

export function popular(limit = 8) {
  return [...allProducts()]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export function newest(limit = 8) {
  return [...allProducts()]
    .sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }))
    .slice(0, limit);
}

export function discounted(limit = 8) {
  return allProducts()
    .filter((product) => product.discount > 0)
    .sort((a, b) => b.discount - a.discount || a.price - b.price)
    .slice(0, limit);
}

export function featured(limit = 8) {
  const list = allProducts().filter((product) => product.featured);
  return list.slice(0, limit);
}

/** Random-looking but stable "picks for you". */
export function recommended(seedKey = "home", limit = 8) {
  return [...allProducts()]
    .sort((a, b) => {
      const hash =
        normalizePersian(`${seedKey}${a.id}`).length + a.id.charCodeAt(2);
      const hashB =
        normalizePersian(`${seedKey}${b.id}`).length + b.id.charCodeAt(2);
      return hash - hashB;
    })
    .slice(0, limit);
}

/** Same category and brand first, then related tags. */
export function related(product, limit = 8) {
  if (!product) return popular(limit);

  // Set membership: `product.tags` is scanned once, not once per candidate.
  const ownTags = new Set(product.tags || []);

  const scored = [];

  allProducts().forEach((item) => {
    if (item.id === product.id) return;

    let score = 0;
    if (item.subcategoryId === product.subcategoryId) score += 40;
    if (item.categoryId === product.categoryId) score += 25;
    if (item.brandId === product.brandId) score += 15;
    score +=
      (item.tags || []).filter((tag) => ownTags.has(tag)).length * 8;
    score += item.rating;

    scored.push({ item, score });
  });

  return scored
    .filter((entry) => entry.score > 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

/** "Frequently bought together" — a deterministic bundle per product. */
export function bundleWith(product, limit = 3) {
  if (!product) return [];
  return allProducts()
    .filter(
      (item) =>
        item.id !== product.id &&
        (item.categoryId !== product.categoryId ||
          item.subcategoryId !== product.subcategoryId),
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

/* ---------------------------------------------------------------------------
   Facet counts (used by the filter sidebar)
   --------------------------------------------------------------------------- */

export function facetCounts(source) {
  const pool = source || allProducts();
  const bySubcategory = new Map();

  pool.forEach((product) => {
    bySubcategory.set(
      product.subcategoryId,
      (bySubcategory.get(product.subcategoryId) || 0) + 1,
    );
  });

  // Category and brand tallies are the whole-catalog counts the memo already
  // holds; only the (unused today) subcategory tally needs a pass of its own.
  return {
    byCategory: source ? countBy(pool, "categoryId") : cache.countsByCategory,
    bySubcategory,
    byBrand: source ? countBy(pool, "brandId") : cache.countsByBrand,
  };
}

/** Product count per category, for the homepage and category page. */
export function categoryCounts() {
  allProducts();
  return Object.fromEntries(cache.countsByCategory);
}

/* ---------------------------------------------------------------------------
   Aggregates for admin analytics
   --------------------------------------------------------------------------- */

export function inventoryStats() {
  const list = allProducts();
  const lowStock = list.filter((product) => product.lowStock);
  const outOfStock = list.filter((product) => product.stock <= 0);

  return {
    total: list.length,
    totalUnits: list.reduce((total, product) => total + product.stock, 0),
    inventoryValue: list.reduce(
      (total, product) => total + product.stock * product.price,
      0,
    ),
    lowStock,
    outOfStock,
    averageRating:
      list.reduce((total, product) => total + product.rating, 0) /
      (list.length || 1),
  };
}

/** Top products by revenue contribution across the seeded orders. */
export function topProducts(orders, limit = 6) {
  const map = new Map();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const current = map.get(item.productId) || {
        productId: item.productId,
        name: item.name,
        units: 0,
        revenue: 0,
      };
      current.units += item.quantity;
      current.revenue += item.lineTotal;
      map.set(item.productId, current);
    });
  });

  return [...map.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

/* ---------------------------------------------------------------------------
   Taxonomy helpers
   --------------------------------------------------------------------------- */

export function taxonomy() {
  return {
    categories: allCategories(),
    groups: categoryGroups,
    subcategories,
    brands: allBrands(),
  };
}

export function subcategoriesOf(categoryId) {
  const category = getCategoryById(categoryId);
  return category?.subcategories || [];
}

export function categoriesWithCounts() {
  const counts = categoryCounts();
  return allCategories().map((category) => ({
    ...category,
    productCount: counts[category.id] || 0,
  }));
}

export function groupsWithCounts() {
  const counts = categoryCounts();
  return categoryGroups.map((group) => {
    const inGroup = allCategories().filter(
      (category) => category.group === group.id,
    );
    return {
      ...group,
      categories: inGroup,
      productCount: inGroup.reduce(
        (total, category) => total + (counts[category.id] || 0),
        0,
      ),
    };
  });
}

/** All distinct tags in the catalog, ordered by frequency. */
export function allTags(limit = 24) {
  allProducts();
  return cache.tags.slice(0, limit);
}

export default {
  allProducts,
  allCategories,
  allBrands,
  getProductBySlug,
  getProductById,
  getCategoryById,
  getBrandById,
  parseFilters,
  hasActiveFilters,
  list,
  popular,
  newest,
  discounted,
  featured,
  recommended,
  related,
  bundleWith,
  facetCounts,
  categoryCounts,
  inventoryStats,
  topProducts,
  taxonomy,
  subcategoriesOf,
  categoriesWithCounts,
  groupsWithCounts,
  allTags,
  decorate,
  SORT_OPTIONS,
  priceBounds,
  invalidateBounds,
  invalidateCatalog,
};
