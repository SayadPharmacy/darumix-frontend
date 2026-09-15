/**
 * DARUMIX — bundle the app for the runtime smoke test.
 *
 * Node cannot execute `.css` imports and this Node version has no module-hook
 * API, so esbuild is used to bundle `src/main.js` (plus its dynamic page chunks)
 * into plain JS that the smoke test can import directly.
 *
 * The CSS import is stubbed with a loader rather than being dropped, which is
 * exactly what Vite does in a browser test environment.
 *
 * Run:  node scripts/bundle-for-test.mjs
 */

import { build } from "esbuild";
import { rmSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outdir = resolve(root, ".smoke");

// Fresh output each run so a stale chunk can never be reported as a pass.
rmSync(outdir, { recursive: true, force: true });
mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [resolve(root, "src/main.js")],
  outdir,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2020",
  splitting: true,
  sourcemap: false,
  logLevel: "error",
  // .css is imported for its side effects in the browser; here it is a no-op.
  loader: { ".css": "empty" },
  define: {
    "process.env.NODE_ENV": '"development"',
  },
});

console.log("bundled for smoke test → .smoke/");
