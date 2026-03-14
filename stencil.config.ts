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
      "<rootDir>/src/core/",
      "<rootDir>/src/modules/nba/",
      "<rootDir>/src/components/error-message/error-message.spec.ts",
      "<rootDir>/src/components/page-404/page-404.spec.ts",
      "<rootDir>/src/components/action-bar/action-bar.spec.ts",
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
