/**
 * BaseElement - Abstract base class for Vanilla Web Components
 * Replaces Stencil's Component decorator and lifecycle hooks
 * @module core/base-element
 */

import type { Signal } from "./signal.js";

/**
 * Abstract base class for all Vanilla Web Components.
 * Provides lifecycle management, signal integration, and attribute observation.
 * Extend this class to create custom web components.
 * @abstract
 */
export abstract class BaseElement extends HTMLElement {
  /**
   * Set of tracked signals for reactive state management.
   * Stores signal-to-unsubscribe function mappings for proper cleanup.
   */
  protected readonly _signals: Map<Signal<unknown>, () => void> = new Map();

  /**
   * Tracks whether the component is currently connected to the DOM.
   */
  protected _isConnected = false;

  /**
   * Flag to prevent multiple render calls in the same microtask.
   * Enables render request batching for performance.
   */
  protected _renderPending = false;

  /**
   * Flag indicating whether the component has completed initialization.
   * Prevents premature rendering during _setupProperties().
   */
  protected _initialized = false;

  /**
   * Array of attribute names to observe for changes.
   * Override in subclasses to observe specific attributes.
   */
  static get observedAttributes(): string[] {
    return [];
  }

  /**
   * Creates a new BaseElement instance.
   * Initializes properties and sets up component.
   */
  constructor() {
    super();
    this._setupProperties();
    this._initialized = true;
  }

  /**
   * Called when the element is added to the DOM.
   * Sets connection state and triggers initial render.
   */
  connectedCallback(): void {
    this._isConnected = true;
    this._render();
  }

  /**
   * Called when the element is removed from the DOM.
   * Sets connection state to false and cleans up tracked signals.
   */
  disconnectedCallback(): void {
    this._isConnected = false;
    this._cleanupSignals();
  }

  /**
   * Called when an observed attribute changes.
   * Triggers render if the value actually changed.
   * @param name - Name of the attribute that changed
   * @param oldValue - Previous value of the attribute
   * @param newValue - New value of the attribute
   */
  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue === newValue) {
      return;
    }

    this._onAttributeChange(name, newValue);
    this._requestRender();
  }

  /**
   * Tracks a signal for reactive re-rendering.
   * Automatically subscribes to the signal and triggers re-renders on value changes.
   * @template T - Type of the signal value
   * @param signal - The signal to track
   * @returns The same signal for convenience
   */
  protected _trackSignal<T>(signal: Signal<T>): Signal<T> {
    // If already tracking this signal, return early
    const signalsMap = this._signals as unknown as Map<Signal<T>, () => void>;
    if (signalsMap.has(signal)) {
      return signal;
    }

    // Subscribe to signal changes and request render on each change
    const unsubscribe = signal.subscribe(() => {
      this._requestRender();
    });

    // Store signal and unsubscribe function
    signalsMap.set(signal, unsubscribe);

    return signal;
  }

  /**
   * Cleans up all tracked signals by unsubscribing from them.
   * Called automatically during disconnectedCallback.
   */
  protected _cleanupSignals(): void {
    for (const [, unsubscribe] of this._signals) {
      unsubscribe();
    }
    this._signals.clear();
  }

  /**
   * Requests a render, batching multiple requests into a single render.
   * Uses queueMicrotask for efficient render coalescing.
   */
  protected _requestRender(): void {
    // Prevent duplicate render requests or rendering before initialization
    if (this._renderPending || !this._initialized) {
      return;
    }

    this._renderPending = true;

    // Batch render requests using microtask
    queueMicrotask(() => {
      this._renderPending = false;
      // Only render if still connected
      if (this._isConnected) {
        this._render();
      }
    });
  }

  /**
   * Dispatches a custom event from the component.
   * @template T - Type of the event detail
   * @param eventName - Name of the custom event
   * @param detail - Data to pass with the event
   */
  protected _emit<T>(eventName: string, detail: T): void {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);
  }

  /**
   * Sets up getters and setters for component properties.
   * Override in subclasses to define reactive properties.
   * @abstract
   */
  protected abstract _setupProperties(): void;

  /**
   * Renders the component's DOM and state.
   * Override in subclasses to implement custom rendering logic.
   * @abstract
   */
  protected abstract _render(): void;

  /**
   * Handles specific attribute changes.
   * Override in subclasses to react to attribute value changes.
   * @param _name - Name of the attribute that changed
   * @param _value - New attribute value or null if removed
   */
  protected _onAttributeChange(_name: string, _value: string | null): void {
    // Default empty implementation - override in subclasses
  }
}
