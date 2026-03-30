/**
 * Vanilla Entry Point
 *
 * This file imports all vanilla web components to ensure they are
 * registered with the custom elements registry. Vite bundles these
 * side effects into a single file for the application.
 */

// Import Tailwind CSS first - must be before component imports
import "./global/tailwind.css";

// Import Shoelace theme and global styles (defines --sl-* variables)
import "./global/app.css";

// Initialize global state and Shoelace
import { getTournaments } from "./modules/init";

getTournaments();

import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";

setBasePath("vanilla/shoelace");

// Import all Shoelace components
import "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@shoelace-style/shoelace/dist/components/badge/badge.js";
import "@shoelace-style/shoelace/dist/components/breadcrumb/breadcrumb.js";
import "@shoelace-style/shoelace/dist/components/breadcrumb-item/breadcrumb-item.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/button-group/button-group.js";
import "@shoelace-style/shoelace/dist/components/card/card.js";
import "@shoelace-style/shoelace/dist/components/carousel/carousel.js";
import "@shoelace-style/shoelace/dist/components/carousel-item/carousel-item.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import "@shoelace-style/shoelace/dist/components/divider/divider.js";
import "@shoelace-style/shoelace/dist/components/drawer/drawer.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/menu/menu.js";
import "@shoelace-style/shoelace/dist/components/menu-item/menu-item.js";
import "@shoelace-style/shoelace/dist/components/option/option.js";
import "@shoelace-style/shoelace/dist/components/radio/radio.js";
import "@shoelace-style/shoelace/dist/components/radio-button/radio-button.js";
import "@shoelace-style/shoelace/dist/components/radio-group/radio-group.js";
import "@shoelace-style/shoelace/dist/components/select/select.js";
import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
import "@shoelace-style/shoelace/dist/components/switch/switch.js";
import "@shoelace-style/shoelace/dist/components/tag/tag.js";

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
import "./components/mad-route/mad-route";
import "./components/app-root/app-root";
