// https://stenciljs.com/docs/config

import replace from "@rollup/plugin-replace";
import type { Config } from "@stencil/core";
import tailwind, { tailwindHMR } from "stencil-tailwind-plugin";
import "dotenv/config";

export const config: Config = {
  globalStyle: "src/global/app.css",
  globalScript: "src/global/app.ts",
  taskQueue: "async",
  sourceMap: false,
  tsconfig: "./tsconfig.stencil.json",
  plugins: [
    tailwind(),
    tailwindHMR(),
    replace({
      preventAssignment: true,
      values: {
        "process.env.API_SPORTS_KEY": JSON.stringify(
          process.env.API_SPORTS_KEY
        ),
      },
    }),
  ],
  outputTargets: [
    {
      type: "www",
      // comment the following line to disable service workers in production
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
