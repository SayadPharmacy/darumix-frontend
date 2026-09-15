import { defineConfig } from "vite";

// DARUMIX — frontend-only, static build.
// Everything is bundled into `dist/` so it can be deployed on Cloudflare Pages
// without any server, database or API.
export default defineConfig({
  base: "./",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2019",
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          data: ["./src/data/products.js"],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
