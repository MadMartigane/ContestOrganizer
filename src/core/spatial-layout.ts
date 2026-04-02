/**
 * SpatialLayout - 3-zone spatial layout manager (Planning, Live, Archive)
 * Handles dynamic resizing, zone focusing, and responsive breakpoints.
 * @module core/spatial-layout
 */

export type ZoneType = "home" | "config" | "tournaments" | "matchs";

export interface ZoneConfig {
  isCollapsed: boolean;
  isFocused: boolean;
  maxWidth: number;
  minWidth: number;
  type: ZoneType;
  width: number;
}

export interface LayoutConfig {
  activeZone: ZoneType;
  isDesktop: boolean;
  isMobile: boolean;
  zones: ZoneConfig[];
}

const ZoneOrder: ZoneType[] = ["home", "config", "tournaments", "matchs"];

const Breakpoints = {
  mobile: 768,
  desktop: 1024,
} as const;

const DefaultZoneWidths: Record<ZoneType, number> = {
  home: 100,
  config: 100,
  tournaments: 100,
  matchs: 100,
};

const DefaultMinWidths: Record<ZoneType, number> = {
  home: 100,
  config: 100,
  tournaments: 100,
  matchs: 100,
};

const DefaultMaxWidths: Record<ZoneType, number> = {
  home: 100,
  config: 100,
  tournaments: 100,
  matchs: 100,
};

type ViewportMode = "mobile" | "tablet" | "desktop";

/**
 * Manages the 3-zone spatial layout with dynamic resizing and zone management.
 * @extends EventTarget
 */
export class SpatialLayout extends EventTarget {
  private readonly container: HTMLElement;
  private readonly zones: Map<ZoneType, ZoneConfig> = new Map();
  private activeZone: ZoneType = "home";
  private viewportMode: ViewportMode = "mobile";
  private resizeObserver: ResizeObserver | null = null;

  /**
   * Creates a new SpatialLayout instance.
   * @param container - The container HTMLElement for the layout
   */
  constructor(container: HTMLElement) {
    super();
    this.container = container;
    this.initializeZones();
    this.setupResizeObserver();
    this.handleResize();
    this.applyLayout();
  }

  /**
   * Initializes zone configurations with default values.
   */
  private initializeZones(): void {
    for (const zoneType of ZoneOrder) {
      this.zones.set(zoneType, {
        type: zoneType,
        width: DefaultZoneWidths[zoneType],
        minWidth: DefaultMinWidths[zoneType],
        maxWidth: DefaultMaxWidths[zoneType],
        isCollapsed: false,
        isFocused: false,
      });
    }
  }

  /**
   * Sets up the resize observer to track container size changes.
   */
  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(this.container);
  }

  /**
   * Sets the active zone.
   * @param zone - The zone to set as active
   */
  setActiveZone(zone: ZoneType): void {
    if (this.activeZone === zone) {
      return;
    }

    this.activeZone = zone;
    this.rebalanceWidths();
    this.applyLayout();
    this.emitLayoutChange("zone-change", { activeZone: zone });
  }

  /**
   * Focuses a zone, expanding it to take more space.
   * @param zone - The zone to focus
   */
  focusZone(zone: ZoneType): void {
    const config = this.zones.get(zone);
    if (!config) {
      return;
    }

    config.isFocused = true;
    this.rebalanceWidths();
    this.applyLayout();
    this.emitLayoutChange("layout-change", this.getLayoutConfig());
  }

  /**
   * Unfocuses all zones, returning to balanced layout.
   */
  unfocusZone(): void {
    let hasChange = false;

    for (const config of Array.from(this.zones.values())) {
      if (config.isFocused) {
        config.isFocused = false;
        hasChange = true;
      }
    }

    if (hasChange) {
      this.rebalanceWidths();
      this.applyLayout();
      this.emitLayoutChange("layout-change", this.getLayoutConfig());
    }
  }

  /**
   * Collapses a zone to its minimum width.
   * @param zone - The zone to collapse
   */
  collapseZone(zone: ZoneType): void {
    const config = this.zones.get(zone);
    if (!config || config.isCollapsed) {
      return;
    }

    config.isCollapsed = true;
    this.rebalanceWidths();
    this.applyLayout();
    this.emitLayoutChange("layout-change", this.getLayoutConfig());
  }

  /**
   * Expands a collapsed zone.
   * @param zone - The zone to expand
   */
  expandZone(zone: ZoneType): void {
    const config = this.zones.get(zone);
    if (!config?.isCollapsed) {
      return;
    }

    config.isCollapsed = false;
    this.rebalanceWidths();
    this.applyLayout();
    this.emitLayoutChange("layout-change", this.getLayoutConfig());
  }

  /**
   * Gets the configuration for a specific zone.
   * @param zone - The zone type to query
   * @returns The zone configuration
   */
  getZoneConfig(zone: ZoneType): ZoneConfig {
    const config = this.zones.get(zone);
    if (!config) {
      throw new Error(`Unknown zone: ${zone}`);
    }
    return { ...config };
  }

  /**
   * Gets configurations for all zones.
   * @returns Array of zone configurations
   */
  getAllZones(): ZoneConfig[] {
    return Array.from(this.zones.values()).map((config) => ({ ...config }));
  }

  /**
   * Determines the viewport mode based on container width.
   * @returns The current viewport mode
   */
  private getViewportMode(): ViewportMode {
    const width = this.container.clientWidth;

    if (width < Breakpoints.mobile) {
      return "mobile";
    }
    if (width < Breakpoints.desktop) {
      return "tablet";
    }
    return "desktop";
  }

  /**
   * Handles window/container resize events.
   */
  handleResize(): void {
    const newMode = this.getViewportMode();

    if (newMode !== this.viewportMode) {
      this.viewportMode = newMode;
      this.applyZoneDefaults();
      this.rebalanceWidths();
      this.applyLayout();
      this.emitLayoutChange("layout-change", this.getLayoutConfig());
    }
  }

  /**
   * Applies default zone configurations for the current viewport mode.
   */
  private applyZoneDefaults(): void {
    // Only apply defaults in mobile mode; tablet/desktop use rebalanceMobile()
    if (this.viewportMode !== "mobile") {
      return;
    }

    for (const zoneType of ZoneOrder) {
      const config = this.zones.get(zoneType);
      if (!config) {
        continue;
      }

      const defaults = DefaultZoneWidths[zoneType];
      const minDefaults = DefaultMinWidths[zoneType];
      const maxDefaults = DefaultMaxWidths[zoneType];

      if (!(config.isCollapsed || config.isFocused)) {
        config.width = defaults;
      }
      config.minWidth = minDefaults;
      config.maxWidth = maxDefaults;
      config.isCollapsed = false;
    }
  }

  /**
   * Rebalances zone widths to fit within bounds and maintain layout.
   */
  private rebalanceWidths(): void {
    if (this.viewportMode === "mobile") {
      this.rebalanceMobile();
      return;
    }

    if (this.viewportMode === "tablet") {
      this.rebalanceTablet();
      return;
    }

    this.rebalanceDesktop();
  }

  /**
   * Rebalances widths for mobile view (one zone visible at a time).
   */
  private rebalanceMobile(): void {
    for (const zoneType of ZoneOrder) {
      const config = this.zones.get(zoneType);
      if (!config) {
        continue;
      }

      if (zoneType === this.activeZone) {
        config.width = 100;
        config.isCollapsed = false;
      } else {
        config.width = 0;
        config.isCollapsed = true;
      }
    }
  }

  /**
   * Rebalances widths for tablet view (delegates to mobile behavior).
   */
  private rebalanceTablet(): void {
    this.rebalanceMobile();
  }

  /**
   * Rebalances widths for desktop view (delegates to mobile behavior).
   */
  private rebalanceDesktop(): void {
    this.rebalanceMobile();
  }

  /**
   * Applies the current layout to the container element.
   */
  private applyLayout(): void {
    const zoneElements = this.container.querySelectorAll<HTMLElement>(
      "home-zone, config-zone, tournaments-zone, matchs-zone"
    );

    for (const element of Array.from(zoneElements)) {
      if (!(element instanceof HTMLElement)) {
        continue;
      }

      const zoneType = (element as { zoneType?: ZoneType }).zoneType;
      if (!zoneType) {
        continue;
      }

      const config = this.zones.get(zoneType);

      if (!config) {
        continue;
      }

      element.style.width = `${config.width}%`;
      element.style.minWidth = `${config.minWidth}%`;
      element.style.maxWidth = `${config.maxWidth}%`;
      element.style.flexShrink = config.isCollapsed ? "1" : "0";
      element.style.flexGrow = config.isFocused ? "1" : "0";

      if (config.isCollapsed && config.width === 0) {
        element.style.visibility = "hidden";
        element.style.overflow = "hidden";
      } else {
        element.style.visibility = "visible";
        element.style.overflow = "visible";
      }

      element.setAttribute(
        "data-active",
        zoneType === this.activeZone ? "true" : "false"
      );
      element.setAttribute("data-collapsed", String(config.isCollapsed));
      element.setAttribute("data-focused", String(config.isFocused));
    }

    this.container.setAttribute("data-viewport", this.viewportMode);
    this.container.setAttribute("data-active-zone", this.activeZone);
  }

  /**
   * Gets the current layout configuration.
   * @returns The current layout configuration
   */
  getLayoutConfig(): LayoutConfig {
    return {
      zones: this.getAllZones(),
      activeZone: this.activeZone,
      isMobile: this.viewportMode === "mobile",
      isDesktop: this.viewportMode === "desktop",
    };
  }

  /**
   * Emits a layout change event.
   * @param eventName - Name of the event
   * @param detail - Event detail
   */
  private emitLayoutChange(eventName: string, detail: unknown): void {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  /**
   * Cleans up the layout manager.
   */
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}
