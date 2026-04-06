import { html } from "lit-html";
import { BaseElement } from "../../core/base-element.js";
import { GestureEngine } from "../../core/gesture-engine.js";
/**
 * ZoneContainer - Container component for spatial zones with gesture and keyboard navigation.
 * Provides zone-specific container with header controls and content slot.
 * Uses Shadow DOM with lit-html rendering.
 */
export class ZoneContainer extends BaseElement {
  gestureEngine;
  layout;
  _zoneType = "home";
  _title = "";
  _icon = "";
  /**
   * Sets up property getters and setters.
   * Called by BaseElement constructor.
   */
  _setupProperties() {
    // Properties are initialized, signals not needed for simple props
    this._initialized = true;
  }
  /**
   * Zone type property getter.
   */
  get zoneType() {
    return this._zoneType;
  }
  /**
   * Zone type property setter.
   */
  set zoneType(value) {
    this._zoneType = value;
    this._requestRender();
  }
  /**
   * Title property getter.
   */
  get title() {
    return this._title;
  }
  /**
   * Title property setter.
   */
  set title(value) {
    this._title = value;
    this._requestRender();
  }
  /**
   * Icon property getter.
   */
  get icon() {
    return this._icon;
  }
  /**
   * Icon property setter.
   */
  set icon(value) {
    this._icon = value;
    this._requestRender();
  }
  /**
   * Initializes the gesture engine for the zone content area.
   */
  _initGestureEngine() {
    const root = this._renderRoot;
    const content = root.querySelector(".zone-content");
    if (content instanceof HTMLElement) {
      this.gestureEngine = new GestureEngine(content);
      this.gestureEngine.enable();
    }
  }
  /**
   * Called when the element is added to the DOM.
   * Sets up gesture engine after render.
   */
  connectedCallback() {
    super.connectedCallback();
    queueMicrotask(() => this._initGestureEngine());
  }
  /**
   * Called when the element is removed from the DOM.
   * Cleans up gesture engine.
   */
  disconnectedCallback() {
    if (this.gestureEngine) {
      this.gestureEngine.disable();
      this.gestureEngine.destroy();
    }
    super.disconnectedCallback();
  }
  /**
   * Handles focus button click - focuses the zone in layout.
   */
  _handleFocus() {
    if (this.layout) {
      this.layout.focusZone(this.zoneType);
    }
  }
  /**
   * Checks if the zone is currently focused.
   */
  _isFocused() {
    if (!this.layout) {
      return false;
    }
    return this.layout.getZoneConfig(this.zoneType).isFocused;
  }
  /**
   * Checks if the zone is currently collapsed.
   */
  _isCollapsed() {
    if (!this.layout) {
      return false;
    }
    return this.layout.getZoneConfig(this.zoneType).isCollapsed;
  }
  /**
   * Sets the layout manager for this zone container.
   * @param layout - The spatial layout instance
   */
  setLayout(layout) {
    this.layout = layout;
    this._requestRender();
  }
  _getStyles() {
    return html`
      <style>
        :host { display: block; height: 100%; }
        .zone-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .zone-container.zone-planning {
          --zone-accent: #ea580c;
          --zone-accent-focused: #ea580c;
        }
        .zone-container.zone-live {
          --zone-accent: #16a34a;
          --zone-accent-focused: #16a34a;
        }
        .zone-container.zone-archive {
          --zone-accent: #ca8a04;
          --zone-accent-focused: #ca8a04;
        }
        .zone-container.zone-home {
          --zone-accent: #ea580c;
          --zone-accent-focused: #ea580c;
        }
        .zone-container.zone-config {
          --zone-accent: #8b5cf6;
          --zone-accent-focused: #8b5cf6;
        }
        .zone-container.zone-tournaments {
          --zone-accent: #ea580c;
          --zone-accent-focused: #ea580c;
        }
        .zone-container.zone-matchs {
          --zone-accent: #16a34a;
          --zone-accent-focused: #16a34a;
        }
        .zone-container.zone-tournament {
          --zone-accent: #ea580c;
          --zone-accent-focused: #ea580c;
        }
        .zone-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background-color: var(--zone-accent, #e5e5e5);
          border-bottom: 2px solid var(--zone-border, #d4d4d4);
          min-height: 3rem;
        }
        .zone-header mad-icon {
          flex-shrink: 0;
        }
        .zone-header h2 {
          flex: 1;
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--zone-text, #171717);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .focus-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          padding: 0;
          background-color: transparent;
          border: 1px solid var(--zone-btn-border, #a3a3a3);
          border-radius: 0.5rem;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 150ms ease, background-color 150ms ease;
          color: var(--zone-btn-text, #171717);
        }
        .focus-btn:hover {
          opacity: 1;
          background-color: var(--zone-btn-hover, #f5f5f5);
        }
        .focus-btn:focus-visible {
          outline: 2px solid var(--zone-accent, #ea580c);
          outline-offset: 2px;
        }
        .focus-btn[hidden] {
          display: none;
        }
        .zone-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          background-color: var(--zone-content-bg, #fafafa);
        }
        .zone-container[data-focused="true"] .zone-header {
          background-color: var(--zone-accent-focused, var(--zone-accent, #ea580c));
        }
        .zone-container[data-focused="true"] .zone-header h2 {
          color: var(--zone-focused-text, #fafafa);
        }
        .zone-container[data-focused="true"] .focus-btn {
          border-color: var(--zone-focused-text, #fafafa);
          color: var(--zone-focused-text, #fafafa);
        }

        /* Dark mode overrides via CSS custom properties */
        html.dark .zone-container {
          --zone-border: #404040;
          --zone-text: #e5e5e5;
          --zone-btn-border: #525252;
          --zone-btn-text: #e5e5e5;
          --zone-btn-hover: #262626;
          --zone-content-bg: #171717;
          --zone-focused-text: #f5f5f5;
        }
      </style>
    `;
  }
  _renderContent() {
    const zoneType = this._zoneType;
    const title = this._title;
    const isFocused = this._isFocused();
    const isCollapsed = this._isCollapsed();
    const showFocusButton = !(isFocused || isCollapsed);
    return html`
      ${this._getStyles()}
      <div part="base" class="zone-container zone-${zoneType}" data-focused="${isFocused}">
        <header part="header" class="zone-header">
          <slot name="icon"></slot>
          <h2 part="title">${title}</h2>
          <button
            part="focus-btn"
            class="focus-btn"
            aria-label="Focus ${title} zone"
            ?hidden=${!showFocusButton}
            @click=${this._handleFocus}
          >
            <mad-icon name="expand"></mad-icon>
          </button>
        </header>
        <div part="content" class="zone-content">
          <slot></slot>
        </div>
      </div>
    `;
  }
  /**
   * Main render method.
   * Uses lit-html for rendering.
   */
  _render() {
    this._renderTemplate(this._renderContent());
  }
}
// Register the custom element
customElements.define("zone-container", ZoneContainer);
