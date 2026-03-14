import path from "node:path";
import { defineConfig } from "vitest/config";

/** Resolve absolute path cross-platform */
const resolvePath = (...segments: string[]) =>
  path.resolve(import.meta.dirname, ...segments);

/**
 * Vitest configuration for Vanilla Web Components testing.
 *
 * Configures:
 * - Test file patterns and environment
 * - Code coverage settings
 * - Path aliases for imports
 * - Test setup files
 */
const vitestConfig = defineConfig({
  test: {
    // Enable global test APIs (describe, it, expect, beforeEach, etc.)
    globals: true,
    // Browser environment for DOM testing
    environment: "jsdom",
    // Test file patterns to include
    include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    // Setup files to run before each test file
    setupFiles: ["./src/test/setup.ts"],

    // Code coverage configuration
    coverage: {
      // Use V8 coverage provider
      provider: "v8",
      // Output coverage reports in text and HTML formats
      reporter: ["text", "html"],
      // Source files to include in coverage
      include: ["src/core/**", "src/modules/**"],
      // Exclude patterns from coverage
      exclude: ["**/*.d.ts", "**/*.spec.ts"],
    },
  },

  // Resolve path aliases for cleaner imports
  resolve: {
    alias: {
      "@": resolvePath("src"),
      "@core": resolvePath("src", "core"),
      "@modules": resolvePath("src", "modules"),
      "@components": resolvePath("src", "components"),
    },
  },
});

export default vitestConfig;
