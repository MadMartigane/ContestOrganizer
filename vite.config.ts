import path from "node:path";
import { defineConfig } from "vite";

const config = defineConfig({
  root: "src", // Serve from src/
  publicDir: "../www", // Serve www/ at root (relative to src/)

  build: {
    outDir: "../www/vanilla",
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: "./vanilla-entry.ts",
      name: "VanillaComponents",
      fileName: "vanilla",
    },
    rollupOptions: {
      output: {
        format: "es",
      },
    },
  },

  resolve: {
    alias: {
      // Use absolute paths (Option A)
      "@": path.resolve(import.meta.dirname, "./src"),
      "@modules": path.resolve(import.meta.dirname, "./src/modules"),
      "@components": path.resolve(import.meta.dirname, "./src/components"),
      "@core": path.resolve(import.meta.dirname, "./src/core"),
    },
  },

  server: {
    port: 5173,
    open: true,
  },

  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },

  esbuild: {
    tsconfigRaw: JSON.stringify({
      compilerOptions: {
        strict: true,
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "bundler",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        jsx: "preserve",
        jsxFactory: "h",
        jsxFragmentFactory: "Fragment",
      },
    }),
  },
});

export default config;
