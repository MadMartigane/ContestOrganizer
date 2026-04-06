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
import "./core/icons";

// Import UI components
import "./components/ui/mad-button/mad-button";
import "./components/ui/mad-icon/mad-icon";
import "./components/ui/mad-input/mad-input";
import "./components/ui/mad-card/mad-card";
import "./components/ui/mad-badge/mad-badge";
import "./components/ui/mad-spinner/mad-spinner";
import "./components/ui/mad-callout/mad-callout";
import "./components/ui/mad-switch/mad-switch";
import "./components/ui/mad-select/mad-select";
import "./components/ui/mad-drawer/mad-drawer";
import "./components/ui/mad-breadcrumb/mad-breadcrumb";
import "./components/ui/mad-tooltip/mad-tooltip";
import "./components/ui/mad-menu/mad-menu";

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
import "./components/zone-container/zone-container";
import "./components/command-palette/command-palette";
import "./components/gesture-overlay/gesture-overlay";
import "./components/zones/home-zone";
import "./components/zones/config-zone";
import "./components/zones/tournaments-zone";
import "./components/zones/matchs-zone";
import "./components/match/live-match-card";
import "./components/match/gesture-scoring";
