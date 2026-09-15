// DARUMIX — build verification.
//
// Loads the built `dist/index.html` in a real DOM (jsdom via Node's built-in
// module resolution is not available here), so instead this script statically
// verifies what actually matters without a browser:
//   1. every route loader in main.js points at a file that exists on disk
//   2. every relative import inside src/ resolves
//   3. the dist bundle exists and references its hashed assets
//
// Run:  node scripts/verify.mjs

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve, relative, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const problems = [];
const notes = [];

function read(path) {
  return readFileSync(resolve(root, path), "utf8");
}

/* ---------------------------------------------------------------------------
   1. Every route loader resolves to a real file
   --------------------------------------------------------------------------- */

const main = read("src/main.js");
const loaders = [
  ...main.matchAll(/import\(\s*["'`](\.\/[^"'`]+)["'`]\s*\)/g),
].map((match) => match[1]);

notes.push(`route loaders declared: ${loaders.length}`);

loaders.forEach((loader) => {
  const target = resolve(root, "src", loader.replace(/^\.\//, ""));
  if (!existsSync(target)) {
    problems.push(`missing page module: src/${loader.replace(/^\.\//, "")}`);
  }
});

/* ---------------------------------------------------------------------------
   2. Every relative import across src/ resolves
   --------------------------------------------------------------------------- */

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".js")) out.push(full);
  }
  return out;
}

const files = walk(resolve(root, "src"));
notes.push(`source modules: ${files.length}`);

const IMPORT_RE = /(?:^|\n)\s*import\s+(?:[\s\S]*?)\s*from\s+["']([^"']+)["']/g;

files.forEach((file) => {
  const source = readFileSync(file, "utf8");
  const name = relative(root, file).replace(/\\/g, "/");

  for (const match of source.matchAll(IMPORT_RE)) {
    const spec = match[1];
    if (!spec.startsWith(".")) continue; // bare import — a dependency

    const resolved = resolve(dirname(file), spec);
    const candidates = [resolved, `${resolved}.js`, join(resolved, "index.js")];

    if (!candidates.some((candidate) => existsSync(candidate))) {
      problems.push(`unresolved import in ${name}: ${spec}`);
    }
  }
});

/* ---------------------------------------------------------------------------
   3. The production bundle exists and is wired up
   --------------------------------------------------------------------------- */

const distIndex = resolve(root, "dist/index.html");

if (!existsSync(distIndex)) {
  problems.push("dist/index.html is missing — run `npm run build`");
} else {
  const html = readFileSync(distIndex, "utf8");
  const assets = [
    ...html.matchAll(/(?:src|href)="\.?\/?(assets\/[^"]+)"/g),
  ].map((match) => match[1]);

  notes.push(`dist assets referenced: ${assets.length}`);

  if (!assets.length)
    problems.push("dist/index.html references no built assets");

  assets.forEach((asset) => {
    if (!existsSync(resolve(root, "dist", asset))) {
      problems.push(`dist asset referenced but not written: ${asset}`);
    }
  });

  if (!existsSync(resolve(root, "dist/favicon.svg"))) {
    problems.push("dist/favicon.svg is missing (public/ was not copied)");
  }
}

/* ---------------------------------------------------------------------------
   Report
   --------------------------------------------------------------------------- */

console.log("DARUMIX verification\n");
notes.forEach((note) => console.log(`  · ${note}`));

if (problems.length) {
  console.log(`\n  ${problems.length} problem(s):`);
  problems.forEach((problem) => console.log(`  ✗ ${problem}`));
  process.exit(1);
}

console.log("\n  ✓ all route modules present");
console.log("  ✓ all relative imports resolve");
console.log("  ✓ production bundle wired up");
