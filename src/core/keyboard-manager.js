/**
 * Keyboard shortcuts manager that maps keyboard input to gesture equivalents
 * for desktop compatibility with touch-based interactions.
 * @module core/keyboard-manager
 */
/**
 * Maps keyboard shortcuts to gesture equivalents for desktop compatibility.
 * Extends EventTarget to allow listening for gesture-triggered events.
 */
export class KeyboardManager extends EventTarget {
  _shortcuts = new Map();
  _enabled = false;
  _boundKeyDownHandler;
  constructor() {
    super();
    this._boundKeyDownHandler = this._handleKeyDown.bind(this);
  }
  /**
   * Generates a unique key for shortcut lookup.
   */
  _getShortcutKey(key, modifiers) {
    const parts = [key.toLowerCase()];
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
  register(shortcut) {
    const key = this._getShortcutKey(shortcut.key, shortcut.modifiers);
    this._shortcuts.set(key, shortcut);
  }
  /**
   * Unregisters a keyboard shortcut.
   * @param key - The primary key to unregister
   * @param modifiers - Optional modifiers to match specific shortcut
   */
  unregister(key, modifiers) {
    const shortcutKey = this._getShortcutKey(key, modifiers);
    this._shortcuts.delete(shortcutKey);
  }
  /**
   * Enables the keyboard manager, adding the event listener.
   */
  enable() {
    if (this._enabled) {
      return;
    }
    this._enabled = true;
    document.addEventListener("keydown", this._boundKeyDownHandler);
  }
  /**
   * Disables the keyboard manager, removing the event listener.
   */
  disable() {
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
  getRegisteredShortcuts() {
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
  setupDefaultGestures() {
    const defaults = [
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
  _isTypingInInput() {
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
  _handleKeyDown(event) {
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
  _dispatchGestureEvent(shortcut) {
    const detail = {
      gesture: shortcut.gesture,
      shortcut,
    };
    const event = new CustomEvent("gesture-triggered", {
      detail,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}
