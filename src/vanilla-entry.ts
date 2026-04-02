/**
 * Vanilla Entry Point
 *
 * This file imports all vanilla web components to ensure they are
 * registered with the custom elements registry. Vite bundles these
 * side effects into a single file for the application.
 */

// Import Tailwind CSS first - must be before component imports
import "./global/tailwind.css";

// Import Web Awesome styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";

// Initialize global state
import { getTournaments } from "./modules/init";

getTournaments();

// Import all Web Awesome components
import "@awesome.me/webawesome/dist/components/callout/callout.js";
import "@awesome.me/webawesome/dist/components/badge/badge.js";
import "@awesome.me/webawesome/dist/components/breadcrumb/breadcrumb.js";
import "@awesome.me/webawesome/dist/components/breadcrumb-item/breadcrumb-item.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/button-group/button-group.js";
import "@awesome.me/webawesome/dist/components/card/card.js";
import "@awesome.me/webawesome/dist/components/carousel/carousel.js";
import "@awesome.me/webawesome/dist/components/carousel-item/carousel-item.js";
import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/divider/divider.js";
import "@awesome.me/webawesome/dist/components/drawer/drawer.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";
import "@awesome.me/webawesome/dist/components/input/input.js";
import "@awesome.me/webawesome/dist/components/option/option.js";
import "@awesome.me/webawesome/dist/components/radio/radio.js";
import "@awesome.me/webawesome/dist/components/radio-group/radio-group.js";
import "@awesome.me/webawesome/dist/components/select/select.js";
import "@awesome.me/webawesome/dist/components/spinner/spinner.js";
import "@awesome.me/webawesome/dist/components/switch/switch.js";
import "@awesome.me/webawesome/dist/components/tag/tag.js";

import setting from "./modules/global-setting/global-setting";

setting.init();

// Import all vanilla web components - side effects register them
import "./components/app-status-news/app-status-news";
import "./components/page-home/page-home";
import "./components/page-404/page-404";
import "./components/error-message/error-message";
import "./components/select-team/select-team";
import "./components/page-match/page-match";
import "./components/match-tile/match-tile";
import "./components/scorer-common/scorer-common";
import "./components/page-tournament-select/page-tournament-select";
import "./components/input-number/input-number";
import "./components/team-tile/team-tile";
import "./components/scorer-basket/scorer-basket";
import "./components/scorer-rugby/scorer-rugby";
import "./components/grid-default/grid-default";
import "./components/grid-basket/grid-basket";
import "./components/page-tournament/page-tournament";
import "./components/app-root/app-root";
import "./components/zone-container/zone-container.js";
import "./components/command-palette/command-palette.js";
import "./components/gesture-overlay/gesture-overlay.js";
import "./components/zones/home-zone.js";
import "./components/zones/config-zone.js";
import "./components/zones/tournaments-zone.js";
import "./components/zones/matchs-zone.js";
import "./components/match/live-match-card.js";
import "./components/match/gesture-scoring.js";
