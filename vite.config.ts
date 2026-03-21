import path from "node:path";
import { defineConfig } from "vite";

const config = defineConfig({
  root: "src",
  // envDir is resolved from the vite.config.ts LOCATION, NOT from root.
  // "." means project root where vite.config.ts lives.
  // ".env" file must exist here with VITE_API_SPORTS_KEY defined.
  envDir: ".",

  publicDir: "../www", // Serve www/ at root (relative to src/)

  build: {
    target: "es2015",
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
        target: "ES2015",
        module: "ES2015",
        moduleResolution: "bundler",
        lib: ["ES2015", "DOM", "DOM.Iterable"],
        jsx: "preserve",
        jsxFactory: "h",
        jsxFragmentFactory: "Fragment",
        downlevelIteration: true,
      },
    }),
  },
});

export default config;
