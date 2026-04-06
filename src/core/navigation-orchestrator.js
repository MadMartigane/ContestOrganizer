import { KeyboardManager } from "./keyboard-manager.js";
import { SpatialLayout } from "./spatial-layout.js";

const ZoneOrder = ["config", "home", "tournaments", "tournament", "matchs"];
export class NavigationOrchestrator extends EventTarget {
  container;
  spatialLayout;
  keyboardManager;
  activeZoneIndex = 0; // Start at "home" (index 0)
  onGestureBound;
  onKeyboardGestureBound;
  constructor(container) {
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
  enable() {
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
    const zoneElements = searchRoot.querySelectorAll(
      "config-zone, home-zone, tournaments-zone, tournament-zone, matchs-zone"
    );
    for (const el of Array.from(zoneElements)) {
      if ("setLayout" in el) {
        el.setLayout(this.spatialLayout);
      }
    }
    // Set initial active zone
    this.setActiveZone(ZoneOrder[this.activeZoneIndex]);
  }
  /**
   * Stops all event listeners.
   */
  disable() {
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
  destroy() {
    this.disable();
    this.spatialLayout.destroy();
  }
  /**
   * Sets the active zone by type.
   */
  setActiveZone(zone) {
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
  handleGesture(event) {
    const gestureEvent = event;
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
  handleKeyboardGesture(event) {
    const detail = event.detail;
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
  navigateNext() {
    const nextIndex = Math.min(this.activeZoneIndex + 1, ZoneOrder.length - 1);
    if (nextIndex !== this.activeZoneIndex) {
      this.setActiveZone(ZoneOrder[nextIndex]);
    }
  }
  /**
   * Navigate to the previous zone (leftward: archive → live → planning).
   */
  navigatePrev() {
    const prevIndex = Math.max(this.activeZoneIndex - 1, 0);
    if (prevIndex !== this.activeZoneIndex) {
      this.setActiveZone(ZoneOrder[prevIndex]);
    }
  }
  /**
   * Gets the currently active zone type.
   */
  getActiveZone() {
    return ZoneOrder[this.activeZoneIndex];
  }
  /**
   * Gets the SpatialLayout instance (for external access if needed).
   */
  getLayout() {
    return this.spatialLayout;
  }
  /**
   * Emits a unified gesture-detected event for the GestureOverlay tutorial.
   */
  emitGestureDetected(zone) {
    const event = new CustomEvent("gesture-detected", {
      bubbles: true,
      composed: true,
      detail: { zone },
    });
    this.container.dispatchEvent(event);
  }
}
