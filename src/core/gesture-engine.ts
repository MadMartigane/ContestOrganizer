export interface GestureConfig {
  longPressDelay: number;
  pinchThreshold: number;
  swipeThreshold: number;
  swipeVelocity: number;
}

export type GestureEventType =
  | "swipe-left"
  | "swipe-right"
  | "swipe-up"
  | "swipe-down"
  | "pinch-in"
  | "pinch-out"
  | "long-press"
  | "double-tap";

export interface GestureRecognizedEvent extends Event {
  detail: {
    type: GestureEventType;
    originX: number;
    originY: number;
    velocity?: number;
    scale?: number;
  };
}

const DEFAULT_CONFIG: GestureConfig = {
  swipeThreshold: 50,
  swipeVelocity: 0.3,
  longPressDelay: 500,
  pinchThreshold: 0.1,
};

const POINTER_DOWN = "pointerdown";
const POINTER_MOVE = "pointermove";
const POINTER_UP = "pointerup";
const POINTER_CANCEL = "pointercancel";

interface PointerState {
  currentX: number;
  currentY: number;
  isTracking: boolean;
  pointerId: number;
  startTime: number;
  startX: number;
  startY: number;
}

interface ActiveGesture {
  pointerId?: number;
  type: "swipe" | "pinch" | "long-press" | "double-tap";
}

export class GestureEngine extends EventTarget {
  private readonly element: HTMLElement;
  private readonly config: GestureConfig;
  private readonly pointers: Map<number, PointerState> = new Map();
  private activeGesture: ActiveGesture | null = null;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private lastTapTime = 0;
  private tapPosition: { x: number; y: number } | null = null;
  private pinchStartDistance = 0;
  private isEnabled = false;

  constructor(element: HTMLElement, config?: Partial<GestureConfig>) {
    super();
    this.element = element;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  enable(): void {
    if (this.isEnabled) {
      return;
    }
    this.isEnabled = true;
    this.element.addEventListener(POINTER_DOWN, this.handlePointerDown);
    this.element.addEventListener(POINTER_MOVE, this.handlePointerMove);
    this.element.addEventListener(POINTER_UP, this.handlePointerUp);
    this.element.addEventListener(POINTER_CANCEL, this.handlePointerCancel);
  }

  disable(): void {
    if (!this.isEnabled) {
      return;
    }
    this.isEnabled = false;
    this.element.removeEventListener(POINTER_DOWN, this.handlePointerDown);
    this.element.removeEventListener(POINTER_MOVE, this.handlePointerMove);
    this.element.removeEventListener(POINTER_UP, this.handlePointerUp);
    this.element.removeEventListener(POINTER_CANCEL, this.handlePointerCancel);
    this.clearLongPressTimer();
    this.pointers.clear();
    this.activeGesture = null;
  }

  destroy(): void {
    this.disable();
    this.pointers.clear();
    this.activeGesture = null;
    this.lastTapTime = 0;
    this.tapPosition = null;
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!this.isEnabled) {
      return;
    }

    const state: PointerState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      startTime: Date.now(),
      isTracking: true,
    };

    this.pointers.set(event.pointerId, state);

    if (this.pointers.size === 1) {
      this.startLongPressDetection(event);
    } else if (this.pointers.size === 2) {
      this.clearLongPressTimer();
      this.startPinchDetection();
    }
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (!this.isEnabled) {
      return;
    }

    const state = this.pointers.get(event.pointerId);
    if (!state?.isTracking) {
      return;
    }

    state.currentX = event.clientX;
    state.currentY = event.clientY;

    if (this.pointers.size === 2 && this.activeGesture?.type === "pinch") {
      this.updatePinchGesture();
    } else if (this.pointers.size === 1 && this.longPressTimer) {
      this.updateLongPressDetection(event);
    }
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (!this.isEnabled) {
      return;
    }

    const state = this.pointers.get(event.pointerId);
    if (!state) {
      return;
    }

    if (this.pointers.size === 1 && state.isTracking) {
      this.clearLongPressTimer();
      this.processSwipeGesture(state);
      this.processDoubleTap(event);
    }

    this.pointers.delete(event.pointerId);

    if (this.pointers.size < 2) {
      this.activeGesture = null;
    }

    if (this.pointers.size === 0) {
      this.activeGesture = null;
    }
  };

  private readonly handlePointerCancel = (event: PointerEvent): void => {
    this.pointers.delete(event.pointerId);
    this.clearLongPressTimer();
    this.activeGesture = null;

    if (this.pointers.size === 0) {
      this.activeGesture = null;
    }
  };

  private startLongPressDetection(event: PointerEvent): void {
    this.clearLongPressTimer();
    this.activeGesture = { type: "long-press", pointerId: event.pointerId };

    this.longPressTimer = setTimeout(() => {
      this.emitGesture("long-press", event.clientX, event.clientY);
      this.activeGesture = null;
    }, this.config.longPressDelay);
  }

  private updateLongPressDetection(event: PointerEvent): void {
    const state = this.pointers.get(event.pointerId);
    if (!state) {
      return;
    }

    const deltaX = Math.abs(event.clientX - state.startX);
    const deltaY = Math.abs(event.clientY - state.startY);

    if (deltaX > 10 || deltaY > 10) {
      this.clearLongPressTimer();
      this.activeGesture = null;
    }
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private startPinchDetection(): void {
    const pointerArray = Array.from(this.pointers.values());
    if (pointerArray.length < 2) {
      return;
    }

    const [p1, p2] = pointerArray;
    this.pinchStartDistance = Math.hypot(
      p2.currentX - p1.currentX,
      p2.currentY - p1.currentY
    );
    this.activeGesture = { type: "pinch" };
  }

  private updatePinchGesture(): void {
    const pointerArray = Array.from(this.pointers.values());
    if (pointerArray.length < 2) {
      return;
    }

    const [p1, p2] = pointerArray;
    const currentDistance = Math.hypot(
      p2.currentX - p1.currentX,
      p2.currentY - p1.currentY
    );
    const scaleChange = currentDistance / this.pinchStartDistance;

    if (Math.abs(scaleChange - 1) >= this.config.pinchThreshold) {
      const centerX = (p1.currentX + p2.currentX) / 2;
      const centerY = (p1.currentY + p2.currentY) / 2;
      const gestureType = scaleChange > 1 ? "pinch-out" : "pinch-in";

      this.emitGesture(gestureType, centerX, centerY, undefined, scaleChange);
      this.pinchStartDistance = currentDistance;
    }
  }

  private processSwipeGesture(state: PointerState): void {
    const deltaX = state.currentX - state.startX;
    const deltaY = state.currentY - state.startY;
    const duration = Date.now() - state.startTime;

    const distance = Math.hypot(deltaX, deltaY);
    if (distance < this.config.swipeThreshold) {
      return;
    }

    const velocity = duration > 0 ? distance / duration : 0;
    if (velocity < this.config.swipeVelocity) {
      return;
    }

    let gestureType: GestureEventType;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      gestureType = deltaX > 0 ? "swipe-right" : "swipe-left";
    } else {
      gestureType = deltaY > 0 ? "swipe-down" : "swipe-up";
    }

    this.emitGesture(gestureType, state.startX, state.startY, velocity);
  }

  private processDoubleTap(event: PointerEvent): void {
    const now = Date.now();
    const timeSinceLastTap = now - this.lastTapTime;

    if (
      this.tapPosition &&
      timeSinceLastTap < 300 &&
      Math.abs(event.clientX - this.tapPosition.x) < 50 &&
      Math.abs(event.clientY - this.tapPosition.y) < 50
    ) {
      this.emitGesture("double-tap", this.tapPosition.x, this.tapPosition.y);
      this.lastTapTime = 0;
      this.tapPosition = null;
    } else {
      this.lastTapTime = now;
      this.tapPosition = { x: event.clientX, y: event.clientY };
    }
  }

  private emitGesture(
    type: GestureEventType,
    originX: number,
    originY: number,
    velocity?: number,
    scale?: number
  ): void {
    const gestureEvent = new CustomEvent("gesture", {
      bubbles: true,
      composed: true,
      detail: { type, originX, originY, velocity, scale },
    }) as GestureRecognizedEvent;

    this.dispatchEvent(gestureEvent);
  }
}
