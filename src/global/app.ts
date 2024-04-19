import '@ionic/core';

/* ########### SHOELACE IMPORT ############### */

import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

// Components declarations
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/breadcrumb/breadcrumb.js';
import '@shoelace-style/shoelace/dist/components/breadcrumb-item/breadcrumb-item.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/button-group/button-group.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/divider/divider.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@shoelace-style/shoelace/dist/components/tag/tag.js';

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
      mode: 'ios',
      // mode: 'md',
    },
  };

  setting.init();
};
