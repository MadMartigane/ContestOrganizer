/**
 * Keyboard shortcuts manager that maps keyboard input to gesture equivalents
 * for desktop compatibility with touch-based interactions.
 * @module core/keyboard-manager
 */

/**
 * Supported gesture types that keyboard shortcuts can trigger.
 */
export type GestureType =
  | "swipe-left"
  | "swipe-right"
  | "swipe-up"
  | "swipe-down"
  | "pinch-in"
  | "pinch-out"
  | "long-press"
  | "double-tap";

/**
 * Represents a keyboard shortcut with its gesture equivalent.
 */
export interface KeyboardShortcut {
  /** Human-readable description for documentation */
  description: string;
  /** The gesture to trigger when shortcut matches */
  gesture: GestureType;
  /** The primary key (e.g., 'ArrowLeft', 'Enter', 'z') */
  key: string;
  /** Optional modifier keys */
  modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  };
}

/**
 * Event emitted when a keyboard shortcut triggers its gesture.
 */
export interface GestureEventDetail {
  gesture: GestureType;
  shortcut: KeyboardShortcut;
}

/**
 * Maps keyboard shortcuts to gesture equivalents for desktop compatibility.
 * Extends EventTarget to allow listening for gesture-triggered events.
 */
export class KeyboardManager extends EventTarget {
  private readonly _shortcuts: Map<string, KeyboardShortcut> = new Map();
  private _enabled = false;
  private readonly _boundKeyDownHandler: (event: KeyboardEvent) => void;

  constructor() {
    super();
    this._boundKeyDownHandler = this._handleKeyDown.bind(this);
  }

  /**
   * Generates a unique key for shortcut lookup.
   */
  private _getShortcutKey(
    key: string,
    modifiers?: Readonly<{
      ctrl?: boolean;
      alt?: boolean;
      shift?: boolean;
      meta?: boolean;
    }>
  ): string {
    const parts: string[] = [key.toLowerCase()];
    if (modifiers?.ctrl) {
      parts.unshift("ctrl");
    }
    if (modifiers?.alt) {
      parts.unshift("alt");
    }
    if (modifiers?.shift) {
      parts.unshift("shift");
    }
    if (modifiers?.meta) {
      parts.unshift("meta");
    }
    return parts.join("+");
  }

  /**
   * Registers a keyboard shortcut.
   * @param shortcut - The shortcut to register
   */
  register(shortcut: KeyboardShortcut): void {
    const key = this._getShortcutKey(shortcut.key, shortcut.modifiers);
    this._shortcuts.set(key, shortcut);
  }

  /**
   * Unregisters a keyboard shortcut.
   * @param key - The primary key to unregister
   * @param modifiers - Optional modifiers to match specific shortcut
   */
  unregister(
    key: string,
    modifiers?: Readonly<{
      ctrl?: boolean;
      alt?: boolean;
      shift?: boolean;
      meta?: boolean;
    }>
  ): void {
    const shortcutKey = this._getShortcutKey(key, modifiers);
    this._shortcuts.delete(shortcutKey);
  }

  /**
   * Enables the keyboard manager, adding the event listener.
   */
  enable(): void {
    if (this._enabled) {
      return;
    }
    this._enabled = true;
    document.addEventListener("keydown", this._boundKeyDownHandler);
  }

  /**
   * Disables the keyboard manager, removing the event listener.
   */
  disable(): void {
    if (!this._enabled) {
      return;
    }
    this._enabled = false;
    document.removeEventListener("keydown", this._boundKeyDownHandler);
  }

  /**
   * Returns all registered shortcuts.
   * @returns Array of registered keyboard shortcuts
   */
  getRegisteredShortcuts(): KeyboardShortcut[] {
    return Array.from(this._shortcuts.values());
  }

  /**
   * Sets up default gesture equivalents for common keyboard keys.
   * - ArrowLeft : swipe-left
   * - ArrowRight : swipe-right
   * - ArrowUp : swipe-up
   * - ArrowDown : swipe-down
   * - Enter : pinch-out
   * - Escape : pinch-in
   * - Cmd+Z : double-tap (shake/undo)
   */
  setupDefaultGestures(): void {
    const defaults: KeyboardShortcut[] = [
      {
        key: "ArrowLeft",
        gesture: "swipe-right",
        description: "Navigate to previous zone (left)",
      },
      {
        key: "ArrowRight",
        gesture: "swipe-left",
        description: "Navigate to next zone (right)",
      },
      {
        key: "ArrowUp",
        gesture: "swipe-up",
        description: "Navigate up (equivalent to swipe up)",
      },
      {
        key: "ArrowDown",
        gesture: "swipe-down",
        description: "Navigate down (equivalent to swipe down)",
      },
      {
        key: "Enter",
        gesture: "pinch-out",
        description: "Expand/zoom (equivalent to pinch out)",
      },
      {
        key: "Escape",
        gesture: "pinch-in",
        description: "Collapse/close (equivalent to pinch in)",
      },
      {
        key: "z",
        modifiers: { meta: true },
        gesture: "double-tap",
        description: "Undo (equivalent to double tap / shake)",
      },
    ];

    for (const shortcut of defaults) {
      this.register(shortcut);
    }
  }

  /**
   * Checks if the user is currently typing in an input field.
   */
  private _isTypingInInput(): boolean {
    const activeElement = document.activeElement;
    if (!activeElement) {
      return false;
    }

    const tagName = activeElement.tagName.toLowerCase();
    if (tagName === "input" || tagName === "textarea") {
      return true;
    }

    if (activeElement instanceof HTMLSelectElement) {
      return true;
    }

    if (
      activeElement instanceof HTMLElement &&
      activeElement.isContentEditable
    ) {
      return true;
    }

    return false;
  }

  /**
   * Handles keydown events and dispatches gesture events when shortcuts match.
   */
  private _handleKeyDown(event: KeyboardEvent): void {
    // Ignore shortcuts when user is typing in input fields
    if (this._isTypingInInput()) {
      return;
    }

    const key = event.key.toLowerCase();
    const modifiers = {
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey,
      meta: event.metaKey,
    };

    const shortcutKey = this._getShortcutKey(key, modifiers);
    const shortcut = this._shortcuts.get(shortcutKey);

    if (!shortcut) {
      // Try without modifiers for keys like ArrowLeft, Enter, Escape
      const shortcutWithoutModifiers = this._shortcuts.get(
        this._getShortcutKey(key)
      );
      if (shortcutWithoutModifiers && !shortcutWithoutModifiers.modifiers) {
        // Only match if the shortcut truly has no modifiers defined
        event.preventDefault();
        this._dispatchGestureEvent(shortcutWithoutModifiers);
        return;
      }
      return;
    }

    event.preventDefault();
    this._dispatchGestureEvent(shortcut);
  }

  /**
   * Dispatches a gesture-triggered custom event.
   */
  private _dispatchGestureEvent(shortcut: KeyboardShortcut): void {
    const detail: GestureEventDetail = {
      gesture: shortcut.gesture,
      shortcut,
    };

    const event = new CustomEvent<GestureEventDetail>("gesture-triggered", {
      detail,
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);
  }
}
