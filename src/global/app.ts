import '@ionic/core';

/* ########### SPECTRUM IMPORT ############### */

import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/number-field/sp-number-field.js';
import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/theme/src/themes.js';

/* ########### END OF SPECTRUM IMPORT ############### */

/* ########### SHOELACE IMPORT ############### */

import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

// Set the base path to the folder you copied Shoelace's assets to
setBasePath('build/shoelace');

/* ########### END OF SHOELACE IMPORT ############### */

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
      // mode: 'ios',
      mode: 'md',
    },
  };

  setting.init();
};
