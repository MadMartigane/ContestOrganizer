/**
 * RouteSync - Bidirectional URL ↔ NavigationOrchestrator sync.
 *
 * URL format: #/zone/<active-zone>[/<view-path>]
 * Examples: #/zone/planning, #/zone/live/tournament/123, #/zone/archive
 *
 * Legacy URL migration: URLs without #/zone/ prefix are migrated:
 *   #/tournament/123 → #/zone/planning/tournament/123
 *   #/tournaments    → #/zone/planning/tournaments
 *   #/home           → #/zone/planning/home
 *   #/config         → #/zone/planning/config
 *   #/match/123      → #/zone/live/match/123
 */

import type { ZoneType } from "./spatial-layout.js";

const ZONE_PREFIX = "#/zone/";
const LEGACY_ROUTE_MAP: Record<string, ZoneType> = {
  "/tournaments": "tournaments",
  "/home": "home",
  "/config": "config",
  "/match": "matchs",
  "/matchs": "matchs",
  "/tournament": "tournaments",
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
      this.dispatchEvent(
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
    if (!hash) {
      return null;
    }

    // New format: #/zone/<zone>[/<path>]
    if (hash.startsWith(ZONE_PREFIX)) {
      const rest = hash.slice(ZONE_PREFIX.length);
      const slashIdx = rest.indexOf("/");
      const zone = (
        slashIdx === -1 ? rest : rest.slice(0, slashIdx)
      ) as ZoneType;
      const path = slashIdx === -1 ? "" : rest.slice(slashIdx);

      if (["home", "config", "tournaments", "matchs"].includes(zone)) {
        return { zone: zone as ZoneType, path };
      }
    }

    // Legacy format migration: #/tournament/123 → zone: planning, path: /tournament/123
    for (const [prefix, zone] of Object.entries(LEGACY_ROUTE_MAP)) {
      if (hash === prefix || hash.startsWith(`${prefix}/`)) {
        return { zone, path: hash.slice(1) }; // keep leading slash: /tournament/123
      }
    }

    // Default to home zone for unrecognized routes
    return { zone: "home", path: hash.slice(1) };
  }
}
