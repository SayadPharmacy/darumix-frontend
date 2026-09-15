/**
 * DARUMIX — hash router.
 *
 * Hash routing is deliberate: the built app is a static bundle served by
 * Cloudflare Pages, and a hash router needs no server-side rewrite rules, no
 * 404 fallback and no base-path configuration. Links stay shareable and the
 * back/forward buttons behave normally.
 *
 * Routes are declared as patterns with `:param` segments, e.g.
 *   '/product/:slug'  →  { params: { slug: '...' } }
 */

import { appEvents, EVENTS } from "./event-bus.js";

/* ---------------------------------------------------------------------------
   Pattern compilation
   --------------------------------------------------------------------------- */

const compiledRoutes = [];

function compile(pattern) {
  const segments = pattern.split("/").filter(Boolean);
  const params = [];

  const regexSource = segments
    .map((segment) => {
      if (segment.startsWith(":")) {
        params.push(segment.slice(1));
        return "/([^/]+)";
      }
      if (segment === "*") {
        params.push("rest");
        return "/(.*)";
      }
      return `/${segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`;
    })
    .join("");

  return {
    pattern,
    params,
    regex: new RegExp(`^${regexSource || "/"}/?$`, "i"),
  };
}

/**
 * Register a route.
 * @param {string} pattern e.g. '/catalog' or '/product/:slug'
 * @param {() => any} loader  dynamic import of the page module
 * @param {{ title?: string, admin?: boolean }} [meta]
 */
export function route(pattern, loader, meta = {}) {
  const compiled = compile(pattern);
  compiledRoutes.push({ ...compiled, loader, meta });
}

/* ---------------------------------------------------------------------------
   Location parsing
   --------------------------------------------------------------------------- */

/** Read the current hash into a normalised `{ path, query }`. */
export function parseLocation(hash = window.location.hash) {
  const cleaned = hash.replace(/^#/, "") || "/";
  const [rawPath, rawQuery = ""] = cleaned.split("?");

  let path = rawPath || "/";
  if (!path.startsWith("/")) path = `/${path}`;

  // Collapse duplicate slashes but keep a single leading one.
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  path = decodeURIComponent(path);

  const query = Object.fromEntries(new URLSearchParams(rawQuery));

  return { path, query, hash: cleaned };
}

/** Build a href for an in-app route. */
export function to(path, query) {
  const params = new URLSearchParams();

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value == null || value === "" || value === false) return;
      if (Array.isArray(value)) {
        value.forEach((entry) => params.append(key, entry));
      } else {
        params.set(key, value);
      }
    });
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const search = params.toString();
  return `#${normalized}${search ? `?${search}` : ""}`;
}

/** Navigate programmatically. */
export function navigate(path, query, options = {}) {
  const href = to(path, query);

  if (options.replace) {
    window.location.replace(href);
  } else {
    window.location.hash = href.slice(1);
  }
}

/** Current query object. */
export function currentQuery() {
  return parseLocation().query;
}

/**
 * Merge query values into the current location, optionally resetting paging.
 * Used all over the catalog so filter state lives in the URL (and therefore in
 * browser history and shared links).
 */
export function updateQuery(patch, { replace = true, resetPage = true } = {}) {
  const { path, query } = parseLocation();
  const next = { ...query, ...patch };

  Object.keys(next).forEach((key) => {
    const value = next[key];
    if (value == null || value === "" || value === false) delete next[key];
  });

  if (resetPage) delete next.page;

  navigate(path, next, { replace });
}

/* ---------------------------------------------------------------------------
   Matching
   --------------------------------------------------------------------------- */

function matchRoute(path) {
  for (const entry of compiledRoutes) {
    const match = entry.regex.exec(path);
    if (!match) continue;

    const params = {};
    entry.params.forEach((name, index) => {
      params[name] = match[index + 1]
        ? decodeURIComponent(match[index + 1])
        : "";
    });

    return { entry, params };
  }

  return null;
}

/* ---------------------------------------------------------------------------
   Rendering
   --------------------------------------------------------------------------- */

let mountTarget = null;
let currentCleanup = () => {};
let currentPath = "";

/** Where pages get rendered. */
export function setMountTarget(element) {
  mountTarget = element;
}

/** The element pages render into. */
export function getMountTarget() {
  return mountTarget;
}

/** Run the current route and render its page into the mount target. */
export async function render() {
  if (!mountTarget) return;

  const { path, query } = parseLocation();

  // Tear down the previous page's listeners before mounting the next one.
  try {
    currentCleanup();
  } catch (error) {
    console.error("[darumix] page cleanup failed:", error);
  }
  currentCleanup = () => {};

  const matched = matchRoute(path);

  if (!matched) {
    const { notFoundPage } = await import("../pages/not-found.js");
    mountTarget.innerHTML = "";
    const result = await notFoundPage({ query, params: {} });
    mountTarget.append(result.node);
    currentCleanup = result.cleanup || (() => {});
    document.title = "صفحه یافت نشد | دارومیکس";
    return;
  }

  const { entry, params } = matched;

  appEvents.emit(EVENTS.loadingStart);

  try {
    const module = await entry.loader();
    const factory = module.default || module.page;
    const result = await factory({ params, query, meta: entry.meta });

    if (!result || !result.node) {
      throw new Error(`Route "${entry.pattern}" returned no node`);
    }

    mountTarget.innerHTML = "";
    // Each page mounts a single `.route-view` root; re-trigger its entry
    // animation so navigation feels alive.
    mountTarget.append(result.node);

    currentCleanup =
      typeof result.cleanup === "function" ? result.cleanup : () => {};

    const title =
      typeof result.title === "string" ? result.title : entry.meta?.title;
    if (title) document.title = `${title} | دارومیکس`;
  } catch (error) {
    console.error(`[darumix] failed to render "${path}":`, error);
    const { errorPage } = await import("../ui/components/states.js");
    mountTarget.innerHTML = "";
    mountTarget.append(
      errorPage({
        title: "بارگذاری صفحه ناموفق بود",
        text: "مشکلی در نمایش این بخش پیش آمد. لطفاً صفحه را دوباره بارگذاری کنید.",
      }).node,
    );
  } finally {
    appEvents.emit(EVENTS.loadingEnd);
  }

  currentPath = path;
}

/** Force a re-render of the active route (without a navigation). */
export function refresh() {
  return render();
}

export function getCurrentPath() {
  return currentPath;
}

/* ---------------------------------------------------------------------------
   Bootstrap
   --------------------------------------------------------------------------- */

export function startRouter() {
  window.addEventListener("hashchange", () => {
    appEvents.emit(EVENTS.routeChange, parseLocation());
    render();
  });

  if (!window.location.hash) {
    // Normalise a bare visit to "#/" so the address bar always reflects state.
    window.location.replace(
      `${window.location.pathname}${window.location.search}#/`,
    );
  }

  appEvents.emit(EVENTS.routeChange, parseLocation());
  return render();
}
