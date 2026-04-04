/**
 * Vanilla Entry Point
 *
 * This file imports all vanilla web components to ensure they are
 * registered with the custom elements registry. Vite bundles these
 * side effects into a single file for the application.
 */

// Import Tailwind CSS
import "./global/tailwind.css";

// Register Phosphor Icons (side-effect imports)
import "./core/icons.js";

// Import UI components
import "./components/ui/mad-button/mad-button.js";
import "./components/ui/mad-icon/mad-icon.js";
import "./components/ui/mad-input/mad-input.js";
import "./components/ui/mad-card/mad-card.js";
import "./components/ui/mad-badge/mad-badge.js";
import "./components/ui/mad-spinner/mad-spinner.js";
import "./components/ui/mad-callout/mad-callout.js";
import "./components/ui/mad-switch/mad-switch.js";
import "./components/ui/mad-select/mad-select.js";
import "./components/ui/mad-drawer/mad-drawer.js";
import "./components/ui/mad-breadcrumb/mad-breadcrumb.js";
import "./components/ui/mad-tooltip/mad-tooltip.js";
import "./components/ui/mad-menu/mad-menu.js";

// Initialize global state
import { getTournaments } from "./modules/init";

getTournaments();

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
