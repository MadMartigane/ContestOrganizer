import { Config } from '@stencil/core';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  sourceMap: false,
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
