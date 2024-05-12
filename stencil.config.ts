// https://stenciljs.com/docs/config
import { Config } from '@stencil/core';
import tailwind, { tailwindHMR } from 'stencil-tailwind-plugin';

export const config: Config = {
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  sourceMap: false,
  plugins: [tailwind(), tailwindHMR()],
  outputTargets: [
    {
      type: 'www',
      // comment the following line to disable service workers in production
      serviceWorker: null,
      baseUrl: '/',
      copy: [{ src: '../node_modules/@shoelace-style/shoelace/dist/assets/', dest: 'build/shoelace/assets' }],
    },
  ],
};
