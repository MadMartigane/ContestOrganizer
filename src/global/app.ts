import '@ionic/core';
import { setupConfig } from '@ionic/core';

/* ########### SPECTRUM IMPORT ############### */
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/button/sp-clear-button.js';
import '@spectrum-web-components/button/sp-close-button.js';

/* ########### END OF SPECTRUM IMPORT ############### */

/**
 * The code to be executed should be placed within a default function that is
 * exported by the global script. Ensure all of the code in the global script
 * is wrapped in the function() that is exported.
 */
export default async () => {
  setupConfig({
    rippleEffect: true,
    mode: 'ios',
  });
};
