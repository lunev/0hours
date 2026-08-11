import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    outDir: "build",
    // storage_keys.ts (and other shared modules) are pulled into both the popup and the
    // background service worker entries, producing a chunk shared across those two
    // "worlds". Chrome then logs a spurious "cross-world extension resource mismatch"
    // warning for the popup's modulepreload of that chunk, so disable modulepreload
    // injection rather than chase an unused-preload warning that has no real perf cost.
    modulePreload: false,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "index.html"),
        background: "./src/background/background.ts",
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "background" ? "background.js" : "assets/[name]-[hash].js";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
