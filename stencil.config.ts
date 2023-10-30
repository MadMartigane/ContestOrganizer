import { Config } from '@stencil/core';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  buildEs5: false,
  enableCache: true,
  sourceMap: true,
  outputTargets: [
    {
      type: 'www',
      // comment the following line to disable service workers in production
      empty: true,
      serviceWorker: null,
      baseUrl: '/',
    },
  ],
};
