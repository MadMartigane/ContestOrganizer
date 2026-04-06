import type { GestureRecognizedEvent } from "./gesture-engine.js";
import {
  type GestureEventDetail,
  KeyboardManager,
} from "./keyboard-manager.js";
import { SpatialLayout, type ZoneType } from "./spatial-layout.js";

const ZoneOrder: ZoneType[] = [
  "config",
  "home",
  "tournaments",
  "tournament",
  "matchs",
];

export class NavigationOrchestrator extends EventTarget {
  private readonly container: HTMLElement;
  private readonly spatialLayout: SpatialLayout;
  private readonly keyboardManager: KeyboardManager;
  private activeZoneIndex = 0; // Start at "home" (index 0)

  private readonly onGestureBound: (e: Event) => void;
  private readonly onKeyboardGestureBound: (e: Event) => void;

  constructor(container: HTMLElement) {
    super();
    this.container = container;

    // Initialize SpatialLayout — it will find [data-zone] elements inside container
    this.spatialLayout = new SpatialLayout(container);

    // Initialize KeyboardManager with default gesture mappings
    this.keyboardManager = new KeyboardManager();
    this.keyboardManager.setupDefaultGestures();

    // Bind handlers
    this.onGestureBound = this.handleGesture.bind(this);
    this.onKeyboardGestureBound = this.handleKeyboardGesture.bind(this);
  }

  /**
   * Starts listening for gesture and keyboard events.
   */
  enable(): void {
    // Listen for bubbled gesture events from ZoneContainer's GestureEngine
    this.container.addEventListener("gesture", this.onGestureBound);

    // Listen for keyboard-triggered gesture events
    this.keyboardManager.addEventListener(
      "gesture-triggered",
      this.onKeyboardGestureBound
    );

    // Enable keyboard manager (adds document-level keydown listener)
    this.keyboardManager.enable();

    // Connect zones to layout
    // If this.container is inside a Shadow DOM, get the host element to find light DOM zones
    const root = this.container.getRootNode();
    const searchRoot = root instanceof ShadowRoot ? root.host : this.container;
    const zoneElements = searchRoot.querySelectorAll<HTMLElement>(
      "config-zone, home-zone, tournaments-zone, tournament-zone, matchs-zone"
    );
    for (const el of Array.from(zoneElements)) {
      if ("setLayout" in el) {
        (el as { setLayout: (l: SpatialLayout) => void }).setLayout(
          this.spatialLayout
        );
      }
    }

    // Set initial active zone
    this.setActiveZone(ZoneOrder[this.activeZoneIndex]);
  }

  /**
   * Stops all event listeners.
   */
  disable(): void {
    this.container.removeEventListener("gesture", this.onGestureBound);
    this.keyboardManager.removeEventListener(
      "gesture-triggered",
      this.onKeyboardGestureBound
    );
    this.keyboardManager.disable();
  }

  /**
   * Cleans up all resources.
   */
  destroy(): void {
    this.disable();
    this.spatialLayout.destroy();
  }

  /**
   * Sets the active zone by type.
   */
  setActiveZone(zone: ZoneType): void {
    this.activeZoneIndex = ZoneOrder.indexOf(zone);
    this.spatialLayout.setActiveZone(zone);

    // Emit unified gesture-detected event for GestureOverlay tutorial
    this.emitGestureDetected(zone);

    // Emit zone-changed event for RouteSync
    this.dispatchEvent(
      new CustomEvent("zone-changed", {
        detail: { zone },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Handles gesture events from GestureEngine (bubbled from zones).
   */
  private handleGesture(event: Event): void {
    const gestureEvent = event as GestureRecognizedEvent;
    const { type } = gestureEvent.detail;

    if (type === "swipe-left") {
      this.navigateNext();
    } else if (type === "swipe-right") {
      this.navigatePrev();
    }

    // Re-emit as gesture-detected for GestureOverlay
    this.emitGestureDetected(this.getActiveZone());
  }

  /**
   * Handles keyboard-triggered gesture events from KeyboardManager.
   */
  private handleKeyboardGesture(event: Event): void {
    const detail = (event as CustomEvent<GestureEventDetail>).detail;
    const { gesture } = detail;

    if (gesture === "swipe-left") {
      this.navigateNext();
    } else if (gesture === "swipe-right") {
      this.navigatePrev();
    } else if (gesture === "pinch-out") {
      // Enter → focus current zone
      this.spatialLayout.focusZone(this.getActiveZone());
    } else if (gesture === "pinch-in") {
      // Escape → unfocus all zones
      this.spatialLayout.unfocusZone();
    }

    this.emitGestureDetected(this.getActiveZone());
  }

  /**
   * Navigate to the next zone (rightward: planning → live → archive).
   */
  private navigateNext(): void {
    const nextIndex = Math.min(this.activeZoneIndex + 1, ZoneOrder.length - 1);
    if (nextIndex !== this.activeZoneIndex) {
      this.setActiveZone(ZoneOrder[nextIndex]);
    }
  }

  /**
   * Navigate to the previous zone (leftward: archive → live → planning).
   */
  private navigatePrev(): void {
    const prevIndex = Math.max(this.activeZoneIndex - 1, 0);
    if (prevIndex !== this.activeZoneIndex) {
      this.setActiveZone(ZoneOrder[prevIndex]);
    }
  }

  /**
   * Gets the currently active zone type.
   */
  getActiveZone(): ZoneType {
    return ZoneOrder[this.activeZoneIndex];
  }

  /**
   * Gets the SpatialLayout instance (for external access if needed).
   */
  getLayout(): SpatialLayout {
    return this.spatialLayout;
  }

  /**
   * Emits a unified gesture-detected event for the GestureOverlay tutorial.
   */
  private emitGestureDetected(zone: ZoneType): void {
    const event = new CustomEvent("gesture-detected", {
      bubbles: true,
      composed: true,
      detail: { zone },
    });
    this.container.dispatchEvent(event);
  }
}
