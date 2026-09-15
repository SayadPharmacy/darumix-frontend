/**
 * DARUMIX — account, orders and notifications service.
 *
 * A signed-in "session" in this demo is simply a persisted profile object;
 * there is no auth server, token or password anywhere near it.
 */

import { slices, commit } from "../core/store.js";
import { appEvents, EVENTS } from "../core/event-bus.js";
import { referenceCode } from "../core/format.js";
import {
  seedOrders,
  seedNotifications,
  seedCustomers,
} from "../data/seed-records.js";
import * as cart from "./cart.js";
import * as catalog from "./catalog.js";

/* ---------------------------------------------------------------------------
   Profile
   --------------------------------------------------------------------------- */

const DEFAULT_PROFILE = {
  id: "me",
  name: "کاربر دارومیکس",
  firstName: "کاربر",
  lastName: "دارومیکس",
  phone: "۰۹۱۲۳۴۵۶۷۸۹",
  email: "me@darumix-demo.ir",
  nationalId: "",
  birthDate: "",
  gender: "",
  loyaltyPoints: 1240,
  walletBalance: 350000,
  joinDate: new Date("2024-02-11T10:00:00.000Z").toISOString(),
  newsletter: true,
};

/** The current profile, or null when no local account exists yet. */
export function profile() {
  return slices.profile.get();
}

/** Guarantee a profile exists, creating the demo account on first use. */
export function ensureProfile() {
  const existing = profile();
  if (existing) return existing;

  const created = { ...DEFAULT_PROFILE };
  slices.profile.set(created);
  commit("profile");
  appEvents.emit(EVENTS.authChanged, created);
  return created;
}

/** Create the demo account explicitly ("sign in" in this frontend demo). */
export function signIn() {
  const existing = profile() || { ...DEFAULT_PROFILE };
  slices.profile.set(existing);
  commit("profile");
  appEvents.emit(EVENTS.authChanged, existing);
  return existing;
}

/** Clear the local profile. The cart and orders are kept on purpose. */
export function signOut() {
  slices.profile.set(null);
  commit("profile");
  appEvents.emit(EVENTS.authChanged, null);
}

export function isSignedIn() {
  return Boolean(profile());
}

export function updateProfile(patch) {
  const next = { ...ensureProfile(), ...patch };
  slices.profile.set(next);
  commit("profile");
  return next;
}

/* ---------------------------------------------------------------------------
   Addresses
   --------------------------------------------------------------------------- */

const DEFAULT_ADDRESS = {
  id: "addr-1",
  title: "خانه",
  recipient: "کاربر دارومیکس",
  phone: "۰۹۱۲۳۴۵۶۷۸۹",
  province: "تهران",
  city: "تهران",
  postalCode: "1987654321",
  line1: "خیابان ولیعصر، بالاتر از پارک ساعی، پلاک ۱۲",
  line2: "واحد ۴، طبقه دوم",
  isDefault: true,
};

export function addresses() {
  const list = slices.addresses.get();
  if (Array.isArray(list) && list.length) return list;

  // Seed one address so checkout is usable immediately.
  slices.addresses.set([DEFAULT_ADDRESS]);
  return [DEFAULT_ADDRESS];
}

export function defaultAddress() {
  const list = addresses();
  return list.find((address) => address.isDefault) || list[0] || null;
}

export function addAddress(address) {
  const list = addresses();
  const created = { ...address, id: address.id || `addr-${Date.now()}` };
  const next = created.isDefault
    ? [...list.map((item) => ({ ...item, isDefault: false })), created]
    : [...list, created];

  slices.addresses.set(next);
  commit("addresses");
  return created;
}

export function updateAddress(id, patch) {
  const list = addresses();
  let next = list.map((address) =>
    address.id === id ? { ...address, ...patch } : address,
  );

  if (patch.isDefault) {
    next = next.map((address) => ({
      ...address,
      isDefault: address.id === id,
    }));
  }

  slices.addresses.set(next);
  commit("addresses");
  return next;
}

export function removeAddress(id) {
  const next = addresses().filter((address) => address.id !== id);
  slices.addresses.set(next);
  commit("addresses");
  return next;
}

export function setDefaultAddress(id) {
  return updateAddress(id, { isDefault: true });
}

/* ---------------------------------------------------------------------------
   Orders
   ------------------------------------------------------------------------- */

/**
 * Orders placed in this browser, newest first, merged with a slice of the
 * seeded demo history so the account page is never empty on a first visit.
 */
export function orders() {
  const own = slices.orders.get();
  const list = Array.isArray(own) ? own : [];
  return [...list].sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
}

export function hasOwnOrders() {
  const own = slices.orders.get();
  return Array.isArray(own) && own.length > 0;
}

/** History shown on the account page: own orders plus demo history. */
export function orderHistory(limit = 12) {
  const own = orders();
  const demo = seedOrders
    .slice(0, limit)
    .map((order) => ({ ...order, demo: true }));
  return [...own, ...demo].slice(0, limit);
}

export function orderById(id) {
  const own = orders().find((order) => order.id === id);
  if (own) return own;
  const demo = seedOrders.find((order) => order.id === id);
  return demo ? { ...demo, demo: true } : null;
}

export function countOrders() {
  return orders().length;
}

/**
 * Create an order from the current cart.
 * @param {{address: object, shippingId: string, paymentMethod: string, couponCode?: string, note?: string}} details
 */
export function createOrder(details) {
  const lineItems = cart.items();

  if (lineItems.length === 0) {
    return { ok: false, reason: "سبد خرید خالی است." };
  }

  const totals = cart.checkoutTotals({
    shippingId: details.shippingId,
    couponCode: details.couponCode,
  });

  const order = {
    id: referenceCode("DRX"),
    customerId: "me",
    customerName: details.address?.recipient || ensureProfile().name,
    customerPhone: details.address?.phone || ensureProfile().phone,
    city: details.address?.city || "",
    address: [
      details.address?.province,
      details.address?.city,
      details.address?.line1,
      details.address?.line2,
    ]
      .filter(Boolean)
      .join("، "),
    items: lineItems.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      price: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    itemCount: totals.units,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    discount: totals.discount,
    total: totals.total,
    couponCode: totals.couponCode,
    status: "pending",
    paymentMethod: details.paymentMethod || "online",
    shippingMethod: totals.shippingId,
    placedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasPrescription: totals.requiresPrescription,
    trackingCode: null,
    note: details.note || "",
    timeline: [
      {
        status: "pending",
        label: "سفارش ثبت شد",
        at: new Date().toISOString(),
      },
    ],
    mine: true,
  };

  slices.orders.set([order, ...orders()]);
  commit("orders");

  pushNotification({
    type: "order",
    title: `سفارش ${order.id} ثبت شد`,
    text: "سفارش شما با موفقیت ثبت شد و پس از تأیید داروساز آماده‌سازی می‌شود.",
    href: "#/account/orders",
  });

  cart.clear();

  return { ok: true, order };
}

export function cancelOrder(id) {
  const next = orders().map((order) =>
    order.id === id && ["pending", "confirmed"].includes(order.status)
      ? {
          ...order,
          status: "cancelled",
          updatedAt: new Date().toISOString(),
          timeline: [
            ...(order.timeline || []),
            {
              status: "cancelled",
              label: "سفارش لغو شد",
              at: new Date().toISOString(),
            },
          ],
        }
      : order,
  );

  slices.orders.set(next);
  commit("orders");
  return next.find((order) => order.id === id) || null;
}

export function reorder(id) {
  const order = orderById(id);
  if (!order) return { added: 0, skipped: 0 };
  return cart.addMany(order.items.map((item) => item.productId));
}

/** Aggregate stats for the account summary cards. */
export function accountStats() {
  const own = orders();
  const spent = own.reduce((total, order) => total + order.total, 0);

  return {
    orders: own.length,
    spent,
    wallet: profile()?.walletBalance || 0,
    points: profile()?.loyaltyPoints || 0,
    wishlist: (slices.wishlist.get() || []).length,
    prescriptions: (slices.prescriptions.get() || []).length,
    consultations: (slices.consultations.get() || []).length,
  };
}

/* ---------------------------------------------------------------------------
   Notifications
   ------------------------------------------------------------------------- */

/** Notifications for the signed-in user: own first, then demo seeds. */
export function notifications() {
  const own = slices.notifications.get();
  const list = Array.isArray(own) ? own : [];
  const demo = seedNotifications.map((notification) => ({
    ...notification,
    demo: true,
  }));
  return [...list, ...demo].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

export function unreadCount() {
  return notifications().filter((notification) => !notification.read).length;
}

export function pushNotification(notification) {
  const own = slices.notifications.get();
  const list = Array.isArray(own) ? own : [];

  const created = {
    id: `n-${Date.now()}`,
    type: "system",
    read: false,
    createdAt: new Date().toISOString(),
    ...notification,
  };

  slices.notifications.set([created, ...list]);
  commit("notifications");
  return created;
}

/**
 * Mark a notification as read. Seeded demo notifications are marked locally
 * via a read-ids list so the fixtures themselves stay untouched.
 */
export function markRead(id) {
  const own = slices.notifications.get();
  const list = Array.isArray(own) ? own : [];

  if (list.some((notification) => notification.id === id)) {
    slices.notifications.set(
      list.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  } else {
    // Seeded demo notifications are not in the store, so their read state lives
    // in a separate id list rather than being written into the fixtures.
    const readIds = new Set(slices.ui.get().readNotifications || []);
    readIds.add(id);
    slices.ui.set({ ...slices.ui.get(), readNotifications: [...readIds] });
  }

  commit("notifications");
}

export function markAllRead() {
  const own = slices.notifications.get();
  const list = Array.isArray(own) ? own : [];

  const nowRead = list.map((notification) => ({ ...notification, read: true }));
  const demoIds = seedNotifications.map((notification) => notification.id);

  slices.notifications.set(nowRead);
  slices.ui.set({ ...slices.ui.get(), readNotifications: demoIds });
  commit("notifications");
}

/** Demo notifications read during this browser session. */
export function readNotificationIds() {
  return new Set(slices.ui.get().readNotifications || []);
}

export function clearNotifications() {
  slices.notifications.set([]);
  commit("notifications");
}

/* ---------------------------------------------------------------------------
   Wishlist / compare / recently viewed
   ------------------------------------------------------------------------- */

export function wishlist() {
  const ids = slices.wishlist.get() || [];
  return ids.map((id) => catalog.getProductById(id)).filter(Boolean);
}

export function wishlistIds() {
  return [...(slices.wishlist.get() || [])];
}

export function inWishlist(productId) {
  return wishlistIds().includes(productId);
}

export function toggleWishlist(productId) {
  const ids = wishlistIds();
  const exists = ids.includes(productId);
  const next = exists
    ? ids.filter((id) => id !== productId)
    : [productId, ...ids];

  slices.wishlist.set(next);
  commit("wishlist");
  appEvents.emit(EVENTS.favoritesChanged, { productId, added: !exists });

  return !exists;
}

export function clearWishlist() {
  slices.wishlist.set([]);
  commit("wishlist");
}

const MAX_COMPARE = 4;

export function compareList() {
  const ids = slices.compare.get() || [];
  return ids.map((id) => catalog.getProductById(id)).filter(Boolean);
}

export function compareIds() {
  return [...(slices.compare.get() || [])];
}

export function inCompare(productId) {
  return compareIds().includes(productId);
}

export function toggleCompare(productId) {
  const ids = compareIds();
  const exists = ids.includes(productId);

  if (exists) {
    slices.compare.set(ids.filter((id) => id !== productId));
    commit("compare");
    appEvents.emit(EVENTS.compareChanged, { productId, added: false });
    return { ok: true, added: false };
  }

  if (ids.length >= MAX_COMPARE) {
    return {
      ok: false,
      reason: `حداکثر ${MAX_COMPARE} محصول را می‌توانید مقایسه کنید.`,
    };
  }

  slices.compare.set([...ids, productId]);
  commit("compare");
  appEvents.emit(EVENTS.compareChanged, { productId, added: true });
  return { ok: true, added: true };
}

export function clearCompare() {
  slices.compare.set([]);
  commit("compare");
}

const MAX_RECENT = 12;

/** Products the user has opened, newest first. */
export function recentlyViewed() {
  return (slices.recentlyViewed.get() || [])
    .map((id) => catalog.getProductById(id))
    .filter(Boolean);
}

export function trackView(productId) {
  if (!productId) return;

  const ids = slices.recentlyViewed.get() || [];
  const next = [productId, ...ids.filter((id) => id !== productId)].slice(
    0,
    MAX_RECENT,
  );

  slices.recentlyViewed.set(next);
  commit("recentlyViewed");
}

export function clearRecentlyViewed() {
  slices.recentlyViewed.set([]);
  commit("recentlyViewed");
}

/* ---------------------------------------------------------------------------
   Search history
   --------------------------------------------------------------------------- */

export function searchHistory() {
  return slices.searchHistory.get() || [];
}

export function rememberSearch(term) {
  const cleaned = String(term || "").trim();
  if (cleaned.length < 2) return;

  const history = searchHistory().filter((entry) => entry !== cleaned);
  slices.searchHistory.set([cleaned, ...history].slice(0, 8));
  commit("searchHistory");
}

export function clearSearchHistory() {
  slices.searchHistory.set([]);
  commit("searchHistory");
}

/* ---------------------------------------------------------------------------
   Reviews
   ------------------------------------------------------------------------- */

/** Reviews written by this user. */
export function myReviews() {
  return slices.reviews.get() || [];
}

export function addReview(review) {
  const list = myReviews();
  const created = {
    id: `r-${Date.now()}`,
    author: profile()?.name || "کاربر دارومیکس",
    date: new Date().toISOString(),
    verified: true,
    helpful: 0,
    ...review,
  };

  slices.reviews.set([created, ...list]);
  commit("reviews");

  pushNotification({
    type: "review",
    title: "نظر شما ثبت شد",
    text: "از ثبت نظر سپاسگزاریم. نظر شما پس از بررسی نمایش داده می‌شود.",
    href: "#/account/reviews",
  });

  return created;
}

export function removeReview(id) {
  slices.reviews.set(myReviews().filter((review) => review.id !== id));
  commit("reviews");
}

/** Reviews written by this user for a specific product. */
export function reviewsForProduct(productId) {
  return myReviews().filter((review) => review.productId === productId);
}

/* ---------------------------------------------------------------------------
   Demo helpers
   --------------------------------------------------------------------------- */

/** Reload the seeded demo history — used by the admin reset action. */
export function seedDemoHistory() {
  return { orders: seedOrders.length, customers: seedCustomers.length };
}

export default {
  profile,
  ensureProfile,
  signIn,
  signOut,
  isSignedIn,
  updateProfile,
  addresses,
  defaultAddress,
  addAddress,
  updateAddress,
  removeAddress,
  setDefaultAddress,
  orders,
  orderHistory,
  orderById,
  hasOwnOrders,
  countOrders,
  createOrder,
  cancelOrder,
  reorder,
  accountStats,
  notifications,
  unreadCount,
  pushNotification,
  markRead,
  markAllRead,
  readNotificationIds,
  clearNotifications,
  wishlist,
  wishlistIds,
  inWishlist,
  toggleWishlist,
  clearWishlist,
  compareList,
  compareIds,
  inCompare,
  toggleCompare,
  clearCompare,
  recentlyViewed,
  trackView,
  clearRecentlyViewed,
  searchHistory,
  rememberSearch,
  clearSearchHistory,
  myReviews,
  addReview,
  removeReview,
  reviewsForProduct,
  seedDemoHistory,
};
