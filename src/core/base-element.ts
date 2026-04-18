/**
 * BaseElement - Abstract base class for Vanilla Web Components
 * Uses lit-html as the rendering engine
 * @module core/base-element
 */

// Re-export html and nothing for subclass convenience
// biome-ignore lint/performance/noBarrelFile: Re-exports required for subclasses to create templates
export { html, nothing } from "lit-html";

// Import render and TemplateResult locally for use in _renderTemplate
import { render, type TemplateResult } from "lit-html";
import setting from "../modules/global-setting/global-setting";
import type { Signal } from "./signal";
import { baseSheet, tailwindSheet } from "./styles";

/**
 * Abstract base class for all Vanilla Web Components.
 * Provides lifecycle management, signal integration, and attribute observation.
 * Uses lit-html for templating.
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
   * Shadow root reference for Shadow DOM support.
   */
  private _shadow: ShadowRoot | null = null;

  /**
   * Unsubscribe function for dark theme change listener.
   */
  private _unsubscribeDarkTheme: (() => void) | null = null;

  /**
   * Array of attribute names to observe for changes.
   * Override in subclasses to observe specific attributes.
   */
  static get observedAttributes(): readonly string[] {
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
   * Creates and returns the render root for the component.
   * By default, creates an open Shadow DOM root.
   * @returns The ShadowRoot to render into
   */
  protected _createRenderRoot(): ShadowRoot {
    if (!this._shadow) {
      this._shadow = this.shadowRoot ?? this.attachShadow({ mode: "open" });
      this._shadow.adoptedStyleSheets = [baseSheet, tailwindSheet];
    }
    return this._shadow;
  }

  /**
   * Injects additional stylesheets into the shadow root.
   * Override in subclasses to inject component-specific styles.
   * @param sheets - CSSStyleSheet objects to add to the shadow root
   */
  protected _injectStyles(...sheets: CSSStyleSheet[]): void {
    if (this._shadow) {
      const existing = this._shadow.adoptedStyleSheets || [];
      this._shadow.adoptedStyleSheets = [...existing, ...sheets];
    }
  }

  /**
   * Sets up getters and setters for component properties.
   * Override in subclasses to define reactive properties.
   * @abstract
   */
  protected abstract _setupProperties(): void;

  /**
   * Returns the render root for the component.
   * Defaults to the shadow root.
   */
  protected get _renderRoot(): ShadowRoot {
    if (!this._shadow) {
      throw new Error(
        "Render root not initialized. Call _createRenderRoot() first."
      );
    }
    return this._shadow;
  }

  /**
   * Called when the element is added to the DOM.
   * Initializes render root, injects styles, and triggers initial render.
   */
  connectedCallback(): void {
    this._isConnected = true;
    this._createRenderRoot();
    this._injectStyles();
    this._render();

    // Subscribe to dark theme changes and apply initial state
    this._handleDarkThemeChange(setting.isDarkThemeActive());
    this._unsubscribeDarkTheme = setting.onDarkThemeChange((isDark) => {
      this._handleDarkThemeChange(isDark);
    });
  }

  /**
   * Called when the element is removed from the DOM.
   * Sets connection state to false and cleans up tracked signals.
   */
  disconnectedCallback(): void {
    if (this._unsubscribeDarkTheme) {
      this._unsubscribeDarkTheme();
      this._unsubscribeDarkTheme = null;
    }

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
    const signalsMap = this._signals as unknown as Map<Signal<T>, () => void>;
    if (signalsMap.has(signal)) {
      return signal;
    }

    const unsubscribe = signal.subscribe(() => {
      this._requestRender();
    });

    signalsMap.set(signal, unsubscribe);

    return signal;
  }

  /**
   * Cleans up all tracked signals by unsubscribing from them.
   * Called automatically during disconnectedCallback.
   */
  protected _cleanupSignals(): void {
    for (const [, unsubscribe] of Array.from(this._signals.entries())) {
      unsubscribe();
    }
    this._signals.clear();
  }

  /**
   * Requests a render, batching multiple requests into a single render.
   * Uses queueMicrotask for efficient render coalescing.
   */
  protected _requestRender(): void {
    if (this._renderPending || !this._initialized) {
      return;
    }

    this._renderPending = true;

    queueMicrotask(() => {
      this._renderPending = false;
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
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Renders a lit-html template result to the component's render root.
   * Subclasses should call this method from their _render() implementation.
   * @param template - The TemplateResult to render
   */
  protected _renderTemplate(template: TemplateResult): void {
    render(template, this._renderRoot);
  }

  /**
   * Handles dark theme changes by toggling the "dark" class on the host element.
   * @param isDark - Whether dark theme is active
   */
  private _handleDarkThemeChange(isDark: boolean): void {
    this.classList.toggle("dark", isDark);
  }

  /**
   * Renders the component's DOM and state.
   * Override in subclasses to implement custom rendering logic.
   * Subclasses should call this._renderTemplate(html`...`) to render.
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
