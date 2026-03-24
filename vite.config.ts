import path from "node:path";
import { defineConfig, loadEnv } from "vite";

/**
 * @LLM-WARNING: CONFIGURATION PARITY REQUIRED
 * This middleware simulates the production config.js generation.
 * Any changes here MUST be mirrored in scripts/deploy.sh.
 * Read docs/CONFIG_MANAGEMENT.md before modifying.
 */
function serveConfigPlugin() {
  return {
    name: "serve-config",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== "/config.js") {
          return next();
        }

        const env = loadEnv(server.config.mode, process.cwd(), "");
        const configStr = JSON.stringify({
          API_SPORTS_KEY: env.VITE_API_SPORTS_KEY,
        });

        res.setHeader("Content-Type", "application/javascript");
        res.end(`window.APP_CONFIG = ${configStr};`);
      });
    },
  };
}

const config = defineConfig({
  plugins: [serveConfigPlugin()],
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
      "@generated": path.resolve(import.meta.dirname, "./src/generated"),
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
