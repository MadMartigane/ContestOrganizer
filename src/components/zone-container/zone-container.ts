/**
 * ZoneContainer - Container component for spatial zones with gesture and keyboard navigation
 * @module components/zone-container
 */

import { BaseElement } from "../../core/base-element.js";
import { GestureEngine } from "../../core/gesture-engine.js";
import type { SpatialLayout, ZoneType } from "../../core/spatial-layout.js";

/**
 * Properties interface for zone container component
 */
export interface ZoneContainerProps {
  icon?: string;
  title: string;
  zoneType: ZoneType;
}

/**
 * ZoneContainer - Container component for spatial zones with gesture and keyboard navigation.
 * Provides zone-specific container with header controls and content slot.
 */
export class ZoneContainer extends BaseElement {
  private gestureEngine: GestureEngine | undefined;
  private layout: SpatialLayout | undefined;

  private _zoneType: ZoneType = "home";
  private _title = "";
  private _icon = "";

  /**
   * Sets up property getters and setters.
   * Called by BaseElement constructor.
   */
  protected _setupProperties(): void {
    // Properties are initialized, signals not needed for simple props
    this._initialized = true;
  }

  /**
   * Creates a light DOM render root (no shadow root).
   */
  protected _createRenderRoot(): Element {
    return this;
  }

  /**
   * Zone type property getter.
   */
  get zoneType(): ZoneType {
    return this._zoneType;
  }

  /**
   * Zone type property setter.
   */
  set zoneType(value: ZoneType) {
    this._zoneType = value;
    this._requestRender();
  }

  /**
   * Title property getter.
   */
  get title(): string {
    return this._title;
  }

  /**
   * Title property setter.
   */
  set title(value: string) {
    this._title = value;
    this._requestRender();
  }

  /**
   * Icon property getter.
   */
  get icon(): string {
    return this._icon;
  }

  /**
   * Icon property setter.
   */
  set icon(value: string) {
    this._icon = value;
    this._requestRender();
  }

  /**
   * Initializes the gesture engine for the zone content area.
   */
  private _initGestureEngine(): void {
    const content = this.querySelector(".zone-content");
    if (content instanceof HTMLElement) {
      this.gestureEngine = new GestureEngine(content);
      this.gestureEngine.enable();
    }
  }

  /**
   * Called when the element is added to the DOM.
   * Sets up gesture engine after render.
   */
  connectedCallback(): void {
    super.connectedCallback();
    queueMicrotask(() => this._initGestureEngine());
  }

  /**
   * Called when the element is removed from the DOM.
   * Cleans up gesture engine.
   */
  disconnectedCallback(): void {
    if (this.gestureEngine) {
      this.gestureEngine.disable();
      this.gestureEngine.destroy();
    }
    super.disconnectedCallback();
  }

  /**
   * Handles focus button click - focuses the zone in layout.
   */
  private _handleFocus(): void {
    if (this.layout) {
      this.layout.focusZone(this.zoneType);
    }
  }

  /**
   * Checks if the zone is currently focused.
   */
  private _isFocused(): boolean {
    if (!this.layout) {
      return false;
    }
    return this.layout.getZoneConfig(this.zoneType).isFocused;
  }

  /**
   * Checks if the zone is currently collapsed.
   */
  private _isCollapsed(): boolean {
    if (!this.layout) {
      return false;
    }
    return this.layout.getZoneConfig(this.zoneType).isCollapsed;
  }

  /**
   * Sets the layout manager for this zone container.
   * @param layout - The spatial layout instance
   */
  setLayout(layout: SpatialLayout): void {
    this.layout = layout;
    this._requestRender();
  }

  /**
   * Returns the CSS for the component.
   */
  private _getCss(): string {
    return `
			.zone-container {
				display: block;
				height: 100%;
			}
			.zone-container.zone-planning {
				--zone-accent: var(--wa-color-primary);
			}
			.zone-container.zone-live {
				--zone-accent: var(--wa-color-success);
			}
			.zone-container.zone-archive {
				--zone-accent: var(--wa-color-warning);
			}
			.zone-container.zone-home {
				--zone-accent: var(--wa-color-primary);
			}
			.zone-container.zone-config {
				--zone-accent: var(--wa-color-secondary);
			}
			.zone-container.zone-tournaments {
				--zone-accent: var(--wa-color-brand);
			}
			.zone-container.zone-matchs {
				--zone-accent: var(--wa-color-success);
			}
			.zone-header {
				display: flex;
				align-items: center;
				gap: 0.5rem;
				padding: 0.75rem 1rem;
				background-color: var(--zone-accent, var(--wa-color-neutral-200));
				border-bottom: 2px solid var(--wa-color-neutral-300);
				min-height: 3rem;
			}
			.zone-header wa-icon {
				flex-shrink: 0;
			}
			.zone-header h2 {
				flex: 1;
				margin: 0;
				font-size: 1rem;
				font-weight: 600;
				color: var(--wa-color-neutral-900);
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
				border: 1px solid var(--wa-color-neutral-400);
				border-radius: var(--wa-border-radius-medium);
				cursor: pointer;
				opacity: 0.7;
				transition: opacity 150ms ease, background-color 150ms ease;
			}
			.focus-btn:hover {
				opacity: 1;
				background-color: var(--wa-color-neutral-100);
			}
			.focus-btn:focus-visible {
				outline: 2px solid var(--zone-accent, var(--wa-color-primary));
				outline-offset: 2px;
			}
			.focus-btn[hidden] {
				display: none;
			}
			.zone-content {
				flex: 1;
				overflow-y: auto;
				overflow-x: hidden;
				background-color: var(--wa-color-neutral-50);
			}
			.zone-container[data-focused="true"] .zone-header {
				background-color: var(--zone-accent, var(--wa-color-primary));
			}
			.zone-container[data-focused="true"] .zone-header h2 {
				color: var(--wa-color-neutral-0);
			}
			.zone-container[data-focused="true"] .focus-btn {
				border-color: var(--wa-color-neutral-0);
				color: var(--wa-color-neutral-0);
			}
		`;
  }

  /**
   * Main render method.
   * Called by BaseElement when reactive state changes.
   */
  protected _render(): void {
    const zoneType = this._zoneType;
    const title = this._title;
    const icon = this._icon;
    const isFocused = this._isFocused();
    const isCollapsed = this._isCollapsed();
    const showFocusButton = !(isFocused || isCollapsed);

    this.innerHTML = `
			<style>
				${this._getCss()}
			</style>
			<div class="zone-container zone-${zoneType}">
				<header class="zone-header">
					${icon ? `<wa-icon name="${icon}"></wa-icon>` : ""}
					<h2>${title}</h2>
					<button
						class="focus-btn"
						@click="${this._handleFocus}"
						?hidden="${!showFocusButton}"
						aria-label="Focus ${title} zone"
					>
						<wa-icon name="expand"></wa-icon>
					</button>
				</header>
				<div class="zone-content">
					<slot></slot>
				</div>
			</div>
		`;
  }
}

// Register the custom element
customElements.define("zone-container", ZoneContainer);
