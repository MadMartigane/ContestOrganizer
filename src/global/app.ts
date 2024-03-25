import '@ionic/core';

/* ########### SPECTRUM IMPORT ############### */
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/button/sp-clear-button.js';
import '@spectrum-web-components/button/sp-close-button.js';

import '@spectrum-web-components/switch/sp-switch.js';

import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/theme/src/themes.js';
/* ########### END OF SPECTRUM IMPORT ############### */

import setting from '../modules/global-setting/global-setting';

/**
 * The code to be executed should be placed within a default function that is
 * exported by the global script. Ensure all of the code in the global script
 * is wrapped in the function() that is exported.
 */

declare global {
  interface Window {
    Ionic: any;
  }
}
export default async () => {
  window.Ionic = {
    config: {
      rippleEffect: true,
      mode: 'ios', // 'md',
    },
  };

  setting.init();
};
