/**
 * BaseElement - Abstract base class for Vanilla Web Components
 * Replaces Stencil's Component decorator and lifecycle hooks
 * @module core/base-element
 */

import type { Signal } from "./signal.js";
import { baseSheet } from "./styles.js";

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
   * Captured light DOM children for slot distribution.
   * Stored before _render() overwrites innerHTML.
   */
  private _initialContent: Node[] | null = null;

  /**
   * Shadow root reference for Shadow DOM support.
   */
  private _shadow: ShadowRoot | null = null;

  /**
   * Template registry for caching compiled templates.
   */
  private static _templates: Map<string, HTMLTemplateElement> = new Map();

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
   * Creates and returns the render root for the component.
   * By default, creates an open Shadow DOM root.
   * Override in subclasses to return `this` for Light DOM (backward compatibility).
   * @returns The Element or ShadowRoot to render into
   */
  protected _createRenderRoot(): Element | ShadowRoot {
    if (!this._shadow) {
      this._shadow = this.attachShadow({ mode: "open" });
      this._shadow.adoptedStyleSheets = [BaseElement._getBaseStyleSheet()];
    }
    return this._shadow;
  }

  /**
   * Returns the render root for the component.
   * Defaults to the shadow root, falls back to the element itself for light DOM.
   */
  protected get _renderRoot(): Element | ShadowRoot {
    return this._shadow ?? this;
  }

  /**
   * Gets the base stylesheet for shadow roots.
   * @returns The shared CSSStyleSheet with base styles
   */
  private static _getBaseStyleSheet(): CSSStyleSheet {
    return baseSheet;
  }

  /**
   * Registers a template for the component.
   * Templates are cached and reused for performance.
   * @param templateId - Unique identifier for the template
   * @param template - The HTMLTemplateElement to register
   */
  protected static _registerTemplate(
    templateId: string,
    template: HTMLTemplateElement
  ): void {
    BaseElement._templates.set(templateId, template);
  }

  /**
   * Retrieves a registered template by ID.
   * @param templateId - The template identifier
   * @returns The template element or undefined if not found
   */
  protected static _getTemplate(
    templateId: string
  ): HTMLTemplateElement | undefined {
    return BaseElement._templates.get(templateId);
  }

  /**
   * Called when the element is added to the DOM.
   * Captures light DOM children, triggers render, then distributes slots.
   */
  connectedCallback(): void {
    this._isConnected = true;
    // Initialize render root (creates shadow DOM if not already created)
    this._createRenderRoot();
    // Capture light DOM children for slot projection
    if (!this._initialContent && this.childNodes.length > 0) {
      this._initialContent = Array.from(this.childNodes);
    }
    this._render();
    // Only distribute slots if using light DOM
    if (!this._shadow) {
      this._distributeSlots();
    }
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
    for (const entry of Array.from(this._signals.entries())) {
      const unsubscribe = entry[1];
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
        this._distributeSlots();
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
   * Replaces <slot> elements in rendered content with captured light DOM children.
   * Supports both default slots and named slots via the 'slot' attribute.
   */
  private _distributeSlots(): void {
    if (!this._initialContent) {
      return;
    }

    const slotElements = Array.from(
      this.querySelectorAll<HTMLSlotElement>("slot")
    );
    for (const slotEl of slotElements) {
      const slotName = slotEl.getAttribute("name");
      const matchedNodes = slotName
        ? this._initialContent.filter(
            (node) =>
              node instanceof Element && node.getAttribute("slot") === slotName
          )
        : this._initialContent.filter(
            (node) => !(node instanceof Element && node.hasAttribute("slot"))
          );

      const fragment = document.createDocumentFragment();
      for (const node of matchedNodes) {
        fragment.appendChild(node.cloneNode(true));
      }
      slotEl.replaceWith(fragment);
    }
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
