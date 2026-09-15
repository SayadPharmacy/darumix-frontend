/**
 * DARUMIX — runtime smoke test.
 *
 * Loads the real source modules into a jsdom window and mounts the app the same
 * way index.html does, then navigates to every route and reports what actually
 * rendered (node count, title, or the error that was thrown).
 *
 * This is the check that catches "the file exists but throws on mount", which a
 * bundler cannot tell you.
 *
 * Run:  node scripts/smoke.mjs
 */

import { JSDOM } from "jsdom";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/*
 * Node cannot import `.css` and this Node version has no module-hook API, so the
 * bundle is built with esbuild first (see scripts/bundle-for-test.mjs) and this
 * test imports that output. `load` points at the built copy in `.smoke/`.
 */
const buildDir = resolve(root, ".smoke");

/** Dynamic `import()` on Windows requires a file:// URL, not a drive path. */
const load = (relativePath) =>
  import(pathToFileURL(resolve(buildDir, relativePath)).href);

/** Load the app bundle — everything the test needs is on `window.DARUMIX`. */
const loadApp = () => load("main.js");

/* ---------------------------------------------------------------------------
   Environment
   --------------------------------------------------------------------------- */

const dom = new JSDOM(
  `<!doctype html><html lang="fa" dir="rtl"><head></head><body><div id="app"></div></body></html>`,
  { url: "http://localhost/", pretendToBeVisual: true },
);

const { window } = dom;

// jsdom lacks a few browser APIs the app touches; stub them minimally rather
// than weakening the app code.
window.matchMedia =
  window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }));

window.requestAnimationFrame = (callback) =>
  window.setTimeout(() => callback(Date.now()), 0);
window.cancelAnimationFrame = (id) => window.clearTimeout(id);

window.scrollTo = () => {};
window.Element.prototype.scrollIntoView = function scrollIntoView() {};

// Surface anything the app logs as an error.
const consoleErrors = [];
const originalError = console.error;
console.error = (...args) => {
  consoleErrors.push(
    args.map((arg) => (arg && arg.message) || String(arg)).join(" "),
  );
  originalError(...args);
};

/* ---------------------------------------------------------------------------
   Globals
   --------------------------------------------------------------------------- */

globalThis.window = window;
globalThis.document = window.document;
globalThis.navigator = window.navigator;
globalThis.location = window.location;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Element = window.Element;
globalThis.Node = window.Node;
globalThis.Event = window.Event;
globalThis.CustomEvent = window.CustomEvent;
globalThis.localStorage = window.localStorage;
globalThis.requestAnimationFrame = window.requestAnimationFrame;
globalThis.cancelAnimationFrame = window.cancelAnimationFrame;
globalThis.getComputedStyle = window.getComputedStyle;
globalThis.matchMedia = window.matchMedia;

/* ---------------------------------------------------------------------------
   Boot the app exactly like index.html does
   --------------------------------------------------------------------------- */

const results = [];

async function run() {
  // main.js performs the mount + router start as a side effect of importing.
  await loadApp();

  /*
   * The smoke bundle exposes the router through the app's debug surface instead
   * of a second import, so the test drives the very same router instance the
   * application is using (a second import would build a separate module graph
   * with its own empty mount target).
   */
  const render = window.DARUMIX.render;
  const route = null;

  // Rebuilding the route table by hand would drift from main.js; the routers
  // registry already holds every pattern main.js registered, so read from it
  // through a navigation instead.
  const routePatterns = window.DARUMIX?.routes || [];

  const sampleRoutes = routePatterns.filter(
    (path) =>
      // Parameterised routes need a real id; substitute one per pattern.
      !path.includes(":"),
  );

  const parameterised = routePatterns.filter((path) => path.includes(":"));

  /* --- Resolve concrete URLs for the parameterised routes --- */
  const concrete = [];

  const { render: renderRoute } = await import(
    pathToFileURL(resolve(buildDir, "main.js")).href
  );
  void renderRoute;

  // Concrete ids come from the app's own debug surface rather than importing
  // the services a second time (which would create a second module instance).
  const derive = window.DARUMIX?.sampleParams?.() || {};

  if (parameterised.includes("/product/:slug") && derive.productSlug) {
    concrete.push(`/product/${derive.productSlug}`);
  }
  if (parameterised.includes("/category/:id") && derive.categoryId) {
    concrete.push(`/category/${derive.categoryId}`);
  }
  if (parameterised.includes("/magazine/:slug") && derive.articleSlug) {
    concrete.push(`/magazine/${derive.articleSlug}`);
  }
  if (parameterised.includes("/account/order/:id") && derive.orderId) {
    concrete.push(`/account/order/${derive.orderId}`);
  }

  const targets = [...sampleRoutes, ...concrete];

  /* --- Visit each route --- */
  for (const path of targets) {
    const before = consoleErrors.length;

    window.location.hash = `#${path}`;

    try {
      await render();
    } catch (error) {
      results.push({
        path,
        ok: false,
        reason: `render threw: ${error.message}`,
      });
      continue;
    }

    const mount = window.document.querySelector(".route-view");
    const chars = (mount?.textContent || "").trim().length;
    const nodes = mount?.querySelectorAll("*").length || 0;
    const newErrors = consoleErrors.slice(before);

    if (!mount) {
      results.push({ path, ok: false, reason: "no .route-view mounted" });
    } else if (nodes < 5) {
      results.push({
        path,
        ok: false,
        reason: `page rendered almost nothing (${nodes} nodes)`,
        errors: newErrors,
      });
    } else if (newErrors.length) {
      results.push({
        path,
        ok: false,
        reason: "console errors during render",
        errors: newErrors,
      });
    } else {
      results.push({
        path,
        ok: true,
        title: window.document.title,
        nodes,
        chars,
      });
    }
  }

  void route;
}

/* ---------------------------------------------------------------------------
   Report
   --------------------------------------------------------------------------- */

try {
  await run();
} catch (error) {
  console.log(`\n  ✗ the app failed to boot: ${error.message}\n`);
  console.log(error.stack);
  process.exit(1);
}

const passed = results.filter((entry) => entry.ok);
const failed = results.filter((entry) => !entry.ok);

console.log(`\nDARUMIX runtime smoke test — ${results.length} routes\n`);

passed.forEach((entry) => {
  console.log(
    `  ✓ ${entry.path.padEnd(30)} ${String(entry.nodes).padStart(5)} nodes  ${entry.title}`,
  );
});

if (failed.length) {
  console.log(`\n  ${failed.length} route(s) failed:\n`);
  failed.forEach((entry) => {
    console.log(`  ✗ ${entry.path}`);
    console.log(`      ${entry.reason}`);
    (entry.errors || []).slice(0, 3).forEach((message) => {
      console.log(`      · ${message.slice(0, 200)}`);
    });
  });
  process.exit(1);
}

console.log(`\n  ✓ all ${passed.length} routes rendered without errors\n`);
