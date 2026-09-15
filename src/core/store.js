/**
 * DARUMIX — observable state container with localStorage persistence.
 *
 * This is the middle layer of the architecture:
 *   UI  →  store  →  services  →  mock data (later: real API)
 *
 * Pages read `state` and call `dispatch(...)`. Nothing else touches
 * localStorage directly, so the eventual swap to a server-backed store is a
 * change in this folder only.
 */

import { EventBus } from "./event-bus.js";

const STORAGE_PREFIX = "darumix:";
const SCHEMA_VERSION = 1;

/** Selectors, so a persisted blob can be migrated without wiping user data. */
export const STORAGE_KEYS = {
  cart: "cart",
  wishlist: "wishlist",
  compare: "compare",
  recentlyViewed: "recently-viewed",
  orders: "orders",
  prescriptions: "prescriptions",
  consultations: "consultations",
  notifications: "notifications",
  reviews: "reviews",
  profile: "profile",
  addresses: "addresses",
  adminState: "admin-state",
  catalogOverrides: "catalog-overrides",
  searchHistory: "search-history",
  ui: "ui",
  version: "schema-version",
};

/** Guarded localStorage — private-mode browsers and SSR both throw. */
const storage = (() => {
  let available = false;

  try {
    const probe = `${STORAGE_PREFIX}__probe`;
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    available = true;
  } catch {
    available = false;
  }

  if (!available) {
    const memory = new Map();
    return {
      available: false,
      get: (key) => (memory.has(key) ? memory.get(key) : null),
      set: (key, value) => memory.set(key, value),
      remove: (key) => memory.delete(key),
    };
  }

  return {
    available: true,
    get(key) {
      try {
        return window.localStorage.getItem(STORAGE_PREFIX + key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(STORAGE_PREFIX + key, value);
      } catch {
        /* quota exceeded — non-fatal, the in-memory state is still correct */
      }
    },
    remove(key) {
      try {
        window.localStorage.removeItem(STORAGE_PREFIX + key);
      } catch {
        /* ignore */
      }
    },
  };
})();

export const isPersistenceAvailable = storage.available;

/* ---------------------------------------------------------------------------
   Persistence helpers
   --------------------------------------------------------------------------- */

function read(key, fallback) {
  const raw = storage.get(key);
  if (raw == null) return fallback;

  try {
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch {
    // Corrupt entry: drop it rather than crash the app on every boot.
    storage.remove(key);
    return fallback;
  }
}

function write(key, value) {
  try {
    storage.set(key, JSON.stringify(value));
  } catch {
    /* serialisation failure is never worth breaking the UI over */
  }
}

function migrate() {
  const seen = Number(read(STORAGE_KEYS.version, 0)) || 0;
  if (seen === SCHEMA_VERSION) return;

  // v0 → v1: nothing to transform yet; future migrations slot in here.
  write(STORAGE_KEYS.version, SCHEMA_VERSION);
}

/* ---------------------------------------------------------------------------
   The store
   --------------------------------------------------------------------------- */

/**
 * Creates one persisted state slice.
 *
 * @param {object} config
 * @param {string} config.key       localStorage key (see STORAGE_KEYS)
 * @param {*}      config.initial   default value when nothing is persisted
 * @param {boolean} [config.persist]
 */
function createSlice({ key, initial, persist = true }) {
  const slice = {
    key,
    state: persist ? read(key, initial) : initial,

    get() {
      return slice.state;
    },

    set(next) {
      slice.state = next;
      if (persist) write(key, next);
      return slice.state;
    },

    update(fn) {
      return slice.set(fn(slice.state));
    },

    reset() {
      slice.state = typeof initial === "function" ? initial() : initial;
      if (persist) write(key, slice.state);
      return slice.state;
    },
  };

  return slice;
}

/* UI state is deliberately NOT persisted — a fresh visit should always start
   with the drawing drawers closed. */
const uiSlice = createSlice({
  key: STORAGE_KEYS.ui,
  initial: {
    cartOpen: false,
    filtersOpen: false,
    navOpen: false,
    searchOpen: false,
  },
  persist: false,
});

export const slices = {
  cart: createSlice({ key: STORAGE_KEYS.cart, initial: [] }),
  wishlist: createSlice({ key: STORAGE_KEYS.wishlist, initial: [] }),
  compare: createSlice({ key: STORAGE_KEYS.compare, initial: [] }),
  recentlyViewed: createSlice({
    key: STORAGE_KEYS.recentlyViewed,
    initial: [],
  }),
  orders: createSlice({ key: STORAGE_KEYS.orders, initial: [] }),
  prescriptions: createSlice({ key: STORAGE_KEYS.prescriptions, initial: [] }),
  consultations: createSlice({ key: STORAGE_KEYS.consultations, initial: [] }),
  notifications: createSlice({ key: STORAGE_KEYS.notifications, initial: [] }),
  reviews: createSlice({ key: STORAGE_KEYS.reviews, initial: [] }),
  addresses: createSlice({ key: STORAGE_KEYS.addresses, initial: [] }),
  profile: createSlice({
    key: STORAGE_KEYS.profile,
    initial: null,
  }),
  adminState: createSlice({ key: STORAGE_KEYS.adminState, initial: null }),
  catalogOverrides: createSlice({
    key: STORAGE_KEYS.catalogOverrides,
    initial: {},
  }),
  searchHistory: createSlice({ key: STORAGE_KEYS.searchHistory, initial: [] }),
  ui: uiSlice,
};

/* ---------------------------------------------------------------------------
   Change notification
   --------------------------------------------------------------------------- */

export const storeEvents = new EventBus();

/** Broadcast that one or more slices changed. */
export function commit(...names) {
  const changed = names.length ? names : Object.keys(slices);
  storeEvents.emit("change", { slices: changed });
}

/**
 * Subscribe to store changes.
 * @param {(payload: {slices: string[]}) => void} handler
 * @returns {() => void} unsubscribe
 */
export function subscribe(handler) {
  return storeEvents.on("change", handler);
}

/** Clear every persisted slice — used by the admin "reset demo data" action. */
export function resetAll() {
  Object.values(slices).forEach((slice) => slice.reset());
  write(STORAGE_KEYS.version, SCHEMA_VERSION);
  commit();
}

migrate();
