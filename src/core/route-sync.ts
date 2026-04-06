/**
 * RouteSync - Bidirectional URL ↔ NavigationOrchestrator sync.
 *
 * URL format: #/<active-zone>[/<view-path>]
 * Examples: #/home, #/tournament/123, #/matchs
 *
 * Legacy URL migration: URLs with #/zone/ prefix are migrated:
 *   #/zone/conf       → #/conf
 *   #/zone/home       → #/home
 *   #/zone/tournaments → #/tournaments
 *   #/zone/tournament/123 → #/tournament/123
 *   #/zone/matchs     → #/matchs
 */

import type { ZoneType } from "./spatial-layout";

const ZONE_PREFIX = "#/";
const LEGACY_ROUTE_MAP: Record<string, ZoneType> = {
  "/zone/conf": "config",
  "/zone/home": "home",
  "/zone/tournaments": "tournaments",
  "/zone/tournament": "tournament",
  "/zone/matchs": "matchs",
  "/zone/match": "matchs",
};

export class RouteSync extends EventTarget {
  private readonly orchestrator: EventTarget & {
    setActiveZone: (z: ZoneType) => void;
    getActiveZone: () => ZoneType;
  };
  private ignoreNextHashChange = false;

  private readonly onHashChangeBound: () => void;
  private readonly onZoneChangedBound: (e: Event) => void;

  constructor(
    orchestrator: EventTarget & {
      setActiveZone: (z: ZoneType) => void;
      getActiveZone: () => ZoneType;
    }
  ) {
    super();
    this.orchestrator = orchestrator;
    this.onHashChangeBound = this.handleHashChange.bind(this);
    this.onZoneChangedBound = this.handleZoneChanged.bind(this);
  }

  /** Start listening to hashchange and orchestrator events. */
  enable(): void {
    window.addEventListener("hashchange", this.onHashChangeBound);
    this.orchestrator.addEventListener("zone-changed", this.onZoneChangedBound);

    // Sync initial state from URL
    this.syncFromUrl();
  }

  /** Stop all listeners. */
  disable(): void {
    window.removeEventListener("hashchange", this.onHashChangeBound);
    this.orchestrator.removeEventListener(
      "zone-changed",
      this.onZoneChangedBound
    );
  }

  /** Handle hashchange → apply to orchestrator. */
  private handleHashChange(): void {
    if (this.ignoreNextHashChange) {
      this.ignoreNextHashChange = false;
      return;
    }
    this.syncFromUrl();
  }

  /** Handle zone-changed → update URL. */
  private handleZoneChanged(event: Event): void {
    const detail = (event as CustomEvent<{ zone: ZoneType }>).detail;
    this.updateUrl(detail.zone);
  }

  /** Parse current URL and apply zone to orchestrator. */
  private syncFromUrl(): void {
    const hash = window.location.hash;
    const parsed = this.parseHash(hash);

    if (parsed) {
      const { zone, path } = parsed;
      if (zone !== this.orchestrator.getActiveZone()) {
        this.orchestrator.setActiveZone(zone);
      }
      // Dispatch a "route-changed" event for view components to consume
      document.dispatchEvent(
        new CustomEvent("route-changed", {
          detail: { zone, path },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  /** Update URL to reflect active zone. */
  private updateUrl(zone: ZoneType): void {
    const currentHash = window.location.hash;
    const expectedPrefix = `${ZONE_PREFIX}${zone}`;

    // If URL already starts with the correct zone prefix, don't mutate
    if (currentHash.startsWith(expectedPrefix)) {
      return;
    }

    // Preserve existing path segments after zone prefix if present
    const parsed = this.parseHash(currentHash);
    const path = parsed?.path ?? "";
    const newHash = `${ZONE_PREFIX}${zone}${path}`;

    this.ignoreNextHashChange = true;
    window.location.hash = newHash;
  }

  /**
   * Parse hash into zone and path.
   * Handles both new format (#/zone/live/tournament/123) and legacy format (#/tournament/123).
   */
  private parseHash(hash: string): { zone: ZoneType; path: string } | null {
    // Empty hash or just "#" → default to home
    if (!hash || hash === "#") {
      return { zone: "home", path: "" };
    }

    // New format: #/zone/<zone>[/<path>]
    if (hash.startsWith(ZONE_PREFIX)) {
      const rest = hash.slice(ZONE_PREFIX.length);
      const slashIdx = rest.indexOf("/");
      const zone = (
        slashIdx === -1 ? rest : rest.slice(0, slashIdx)
      ) as ZoneType;
      const path = slashIdx === -1 ? "" : rest.slice(slashIdx);

      if (
        ["home", "config", "tournaments", "tournament", "matchs"].includes(zone)
      ) {
        return { zone: zone as ZoneType, path };
      }
    }

    // Legacy format migration: #/zone/tournament/123 → zone: tournament, path: /tournament/123
    for (const [prefix, zone] of Object.entries(LEGACY_ROUTE_MAP)) {
      if (hash === prefix || hash.startsWith(`${prefix}/`)) {
        return { zone, path: hash.slice(1) }; // keep leading slash: /tournament/123
      }
    }

    // Default to home zone for unrecognized routes
    return { zone: "home", path: hash.slice(1) };
  }
}
