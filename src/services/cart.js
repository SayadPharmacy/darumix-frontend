/**
 * DARUMIX — cart service.
 *
 * Cart lines store only `productId` and `quantity`; prices are always resolved
 * from the catalog so a price change can never be stale in the basket.
 */

import { slices, commit } from "../core/store.js";
import { appEvents, EVENTS } from "../core/event-bus.js";
import {
  couponByCode,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_METHODS,
} from "../data/statuses.js";
import * as catalog from "./catalog.js";

const MAX_QUANTITY_PER_LINE = 20;

/* ---------------------------------------------------------------------------
   Reads
   --------------------------------------------------------------------------- */

/** Raw cart lines as persisted. */
function lines() {
  const stored = slices.cart.get();
  return Array.isArray(stored) ? stored : [];
}

/**
 * Cart lines joined with live product data.
 * Lines whose product no longer exists are filtered out defensively.
 */
export function items() {
  return lines()
    .map((line) => {
      const product = catalog.getProductById(line.productId);
      if (!product) return null;

      const quantity = Math.max(
        1,
        Math.min(line.quantity, MAX_QUANTITY_PER_LINE),
      );

      return {
        productId: product.id,
        product,
        variant: line.variant || product.variants?.[0] || "",
        quantity,
        unitPrice: product.price,
        compareAt: product.compareAt || null,
        lineTotal: product.price * quantity,
        lineCompareTotal: (product.compareAt || product.price) * quantity,
        inStock: product.stock > 0,
        maxQuantity: Math.min(
          MAX_QUANTITY_PER_LINE,
          Math.max(1, product.stock),
        ),
      };
    })
    .filter(Boolean);
}

/** Number of individual units in the cart (used by the header badge). */
export function count() {
  return lines().reduce(
    (total, line) => total + (Number(line.quantity) || 0),
    0,
  );
}

/** Distinct product count. */
export function lineCount() {
  return lines().length;
}

export function isEmpty() {
  return lines().length === 0;
}

/** Quantity currently in the cart for one product. */
export function quantityOf(productId) {
  const line = lines().find((item) => item.productId === productId);
  return line ? Number(line.quantity) || 0 : 0;
}

export function has(productId) {
  return quantityOf(productId) > 0;
}

/** Totals before shipping and coupons. */
export function totals() {
  const list = items();

  const subtotal = list.reduce((total, item) => total + item.lineTotal, 0);
  const compareSubtotal = list.reduce(
    (total, item) => total + item.lineCompareTotal,
    0,
  );
  const savings = Math.max(0, compareSubtotal - subtotal);
  const units = list.reduce((total, item) => total + item.quantity, 0);

  // Prescription-only lines cannot be checked out until a prescription is on
  // file; the checkout page surfaces this as a blocking notice.
  const requiresPrescription = list.some((item) => item.product.rx);

  return {
    subtotal,
    compareSubtotal,
    savings,
    units,
    lines: list.length,
    requiresPrescription,
    freeShippingGap: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    qualifiesFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD,
    freeShippingProgress: Math.min(
      100,
      Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
    ),
  };
}

/* ---------------------------------------------------------------------------
   Writes
   --------------------------------------------------------------------------- */

function persist(next) {
  slices.cart.set(next);
  commit("cart");
}

/**
 * Add a product, or bump its quantity if already present.
 * @returns {{ok: boolean, reason?: string, quantity?: number}}
 */
export function add(productId, quantity = 1, variant = "") {
  const product = catalog.getProductById(productId);

  if (!product) return { ok: false, reason: "missing" };
  if (product.stock <= 0) return { ok: false, reason: "out-of-stock" };

  const current = lines();
  const index = current.findIndex(
    (line) =>
      line.productId === productId && (line.variant || "") === (variant || ""),
  );
  const ceiling = Math.min(MAX_QUANTITY_PER_LINE, product.stock);

  if (index >= 0) {
    const nextQuantity = Math.min(ceiling, current[index].quantity + quantity);
    const clamped = nextQuantity === current[index].quantity;

    const next = [...current];
    next[index] = { ...current[index], quantity: nextQuantity };
    persist(next);

    if (!clamped)
      appEvents.emit(EVENTS.productAdded, { product, quantity: nextQuantity });

    return {
      ok: !clamped,
      reason: clamped ? "max-reached" : undefined,
      quantity: nextQuantity,
    };
  }

  const nextQuantity = Math.min(ceiling, Math.max(1, quantity));
  persist([
    ...current,
    {
      productId,
      variant: variant || product.variants?.[0] || "",
      quantity: nextQuantity,
    },
  ]);

  appEvents.emit(EVENTS.productAdded, { product, quantity: nextQuantity });

  return { ok: true, quantity: nextQuantity };
}

export function updateQuantity(productId, quantity, variant = "") {
  const product = catalog.getProductById(productId);
  const ceiling = product
    ? Math.min(MAX_QUANTITY_PER_LINE, Math.max(1, product.stock))
    : MAX_QUANTITY_PER_LINE;
  const next = Math.max(1, Math.min(ceiling, Number(quantity) || 1));

  const current = lines().map((line) => {
    const matches =
      line.productId === productId &&
      (!variant || (line.variant || "") === variant);
    return matches ? { ...line, quantity: next } : line;
  });

  persist(current);
  return next;
}

export function increment(productId, variant = "") {
  return updateQuantity(productId, quantityOf(productId) + 1, variant);
}

export function decrement(productId, variant = "") {
  return updateQuantity(productId, quantityOf(productId) - 1, variant);
}

export function remove(productId, variant = "") {
  const next = lines().filter(
    (line) =>
      !(
        line.productId === productId &&
        (!variant || (line.variant || "") === variant)
      ),
  );
  persist(next);
  return next;
}

export function clear() {
  persist([]);
}

/** Replace the whole cart — used when restoring or importing a basket. */
export function replace(nextLines = []) {
  persist(
    nextLines
      .filter((line) => line && line.productId)
      .map((line) => ({
        productId: line.productId,
        variant: line.variant || "",
        quantity: Math.max(
          1,
          Math.min(MAX_QUANTITY_PER_LINE, Number(line.quantity) || 1),
        ),
      })),
  );
}

/** Move everything from the wishlist into the cart, skipping unavailable items. */
export function addMany(productIds = []) {
  const results = productIds.map((id) => add(id, 1));
  return {
    added: results.filter((result) => result.ok).length,
    skipped: results.filter((result) => !result.ok).length,
  };
}

/* ---------------------------------------------------------------------------
   Coupons & shipping
   --------------------------------------------------------------------------- */

/** Validate a coupon code against the current basket. */
export function validateCoupon(code, subtotal) {
  const normalized = String(code || "")
    .trim()
    .toUpperCase();

  if (!normalized) return { ok: false, reason: "کد تخفیف را وارد کنید." };

  const coupon = couponByCode.get(normalized);
  if (!coupon) return { ok: false, reason: "این کد تخفیف معتبر نیست." };

  if (subtotal < coupon.minBasket) {
    return {
      ok: false,
      reason: `این کد برای سبد خرید بالای ${coupon.minBasket.toLocaleString("en-US")} تومان فعال است.`,
    };
  }

  return { ok: true, coupon: { ...coupon, code: normalized } };
}

/** Discount amount a coupon produces for a given subtotal + shipping. */
export function couponDiscount(coupon, subtotal, shipping) {
  if (!coupon) return { discount: 0, shippingDiscount: 0 };

  if (coupon.type === "percent") {
    return {
      discount: Math.min(
        coupon.maxDiscount || Infinity,
        Math.round((subtotal * coupon.value) / 100),
      ),
      shippingDiscount: 0,
    };
  }

  if (coupon.type === "fixed") {
    return {
      discount: Math.min(
        coupon.maxDiscount || coupon.value,
        coupon.value,
        subtotal,
      ),
      shippingDiscount: 0,
    };
  }

  if (coupon.type === "shipping") {
    return { discount: 0, shippingDiscount: shipping };
  }

  return { discount: 0, shippingDiscount: 0 };
}

/**
 * Full order cost breakdown.
 * @param {{shippingId?: string, coupon?: object|null, couponCode?: string}} [options]
 */
export function checkoutTotals(options = {}) {
  const base = totals();
  const shippingMethod =
    SHIPPING_METHODS.find((method) => method.id === options.shippingId) ||
    SHIPPING_METHODS[1];

  // Free shipping is applied automatically above the threshold.
  let shipping = base.qualifiesFreeShipping ? 0 : shippingMethod.price;

  let coupon = options.coupon || null;
  if (!coupon && options.couponCode) {
    const check = validateCoupon(options.couponCode, base.subtotal);
    coupon = check.ok ? check.coupon : null;
  }

  const { discount, shippingDiscount } = couponDiscount(
    coupon,
    base.subtotal,
    shipping,
  );
  shipping = Math.max(0, shipping - shippingDiscount);

  const taxIncluded = 0; // Prices are tax-inclusive in this demo.
  const total = Math.max(0, base.subtotal + shipping - discount);

  return {
    ...base,
    shippingId: shippingMethod.id,
    shippingLabel: shippingMethod.label,
    shipping,
    shippingFree: shipping === 0,
    coupon,
    couponCode: coupon?.code || "",
    discount,
    tax: taxIncluded,
    total,
    payable: total,
  };
}

/** A short human-readable summary of the basket. */
export function summary() {
  const base = totals();
  return {
    count: count(),
    lines: base.lines,
    subtotal: base.subtotal,
    total: base.subtotal,
    savings: base.savings,
  };
}

export default {
  items,
  count,
  lineCount,
  isEmpty,
  quantityOf,
  has,
  totals,
  add,
  addMany,
  updateQuantity,
  increment,
  decrement,
  remove,
  clear,
  replace,
  validateCoupon,
  couponDiscount,
  checkoutTotals,
  summary,
};
