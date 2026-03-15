// https://stenciljs.com/docs/config
import type { Config } from "@stencil/core";

export const config: Config = {
  globalStyle: "src/global/app.css",
  globalScript: "src/global/app.ts",
  taskQueue: "async",
  sourceMap: false,
  tsconfig: "./tsconfig.stencil.json",
  testing: {
    testPathIgnorePatterns: [
      "<rootDir>/src/core/", // Vitest tests for core framework
      "<rootDir>/src/modules/nba/", // Vitest tests for NBA module
      "<rootDir>/src/components/error-message/error-message.spec.ts", // Vanilla component tests
      "<rootDir>/src/components/page-404/page-404.spec.ts", // Vanilla component tests
      "<rootDir>/src/components/action-bar/action-bar.spec.ts", // Vanilla component tests
      "<rootDir>/src/components/page-match/page-match.spec.ts", // Pure function tests
      "<rootDir>/src/components/select-team/select-team.spec.ts", // Vanilla component tests
    ],
  },
  // plugins: [tailwind(), tailwindHMR()], // Disabled - pre-existing error in worktree
  outputTargets: [
    {
      type: "www",
      serviceWorker: null,
      baseUrl: "/",
      copy: [
        {
          src: "../node_modules/@shoelace-style/shoelace/dist/assets/",
          dest: "build/shoelace/assets",
        },
      ],
    },
  ],
};
