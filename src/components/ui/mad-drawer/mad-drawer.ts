import { BaseElement } from "@core/base-element.js";
import { html } from "lit-html";

/**
 * A drawer component that slides in from the side of the screen.
 *
 * Observed attributes:
 * - `open`: Controls the visibility of the drawer
 * - `placement`: Position of the drawer ("start" or "end")
 * - `no-header`: Hides the header slot
 *
 * Custom events:
 * - `mad-close`: Emitted when the drawer is closed (via overlay click or Escape key)
 *
 * @element mad-drawer
 * @fires mad-close
 */
export class MadDrawer extends BaseElement {
  static get observedAttributes(): string[] {
    return ["open", "placement", "no-header"];
  }

  #previousFocus: HTMLElement | null = null;
  readonly #handleKeyDown: (e: KeyboardEvent) => void;
  readonly #handleOverlayClick: (e: Event) => void;

  constructor() {
    super();
    this.#handleKeyDown = this.#onKeyDown.bind(this);
    this.#handleOverlayClick = this.#onOverlayClick.bind(this);
    this._setupProperties();
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(v: boolean) {
    v ? this.setAttribute("open", "") : this.removeAttribute("open");
  }

  get placement(): string {
    return this.getAttribute("placement") ?? "start";
  }

  set placement(v: string) {
    v ? this.setAttribute("placement", v) : this.removeAttribute("placement");
  }

  protected _render(): void {
    const isOpen = this.open;

    this._renderTemplate(html`
      <style>
        :host { display: block; }
        :host([hidden]) { display: none !important; }
        :host { isolation: isolate; }
      </style>
      <div class="drawer-overlay${isOpen ? " open" : ""}" part="overlay" aria-hidden="true" @click=${this.#handleOverlayClick}></div>
      <div class="drawer-panel${isOpen ? " open" : ""}" data-panel part="panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabindex="-1">
        <div class="drawer-content">
          <slot name="header"></slot>
          <div class="drawer-body">
            <slot></slot>
          </div>
          <slot name="footer"></slot>
        </div>
      </div>
      <!-- Hidden title for aria-labelledby -->
      <span id="drawer-title" hidden>Drawer</span>
      <style>
        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 40;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .drawer-overlay.open {
          opacity: 1;
          visibility: visible;
        }
        .drawer-panel {
          position: fixed;
          top: 0;
          height: 100%;
          width: 20rem;
          max-width: 90vw;
          background: white;
          dark-bg: #171717;
          box-shadow: 0 0 25px rgba(0, 0, 0, 0.15);
          z-index: 50;
          transition: transform 0.3s ease-out;
          display: flex;
          flex-direction: column;
        }
        :host([placement="start"]) .drawer-panel {
          left: 0;
          border-right: 1px solid rgb(229, 229, 229);
          dark-border: rgb(38, 38, 38);
        }
        :host([placement="end"]) .drawer-panel {
          right: 0;
          border-left: 1px solid rgb(229, 229, 229);
          dark-border: rgb(38, 38, 38);
        }
        :host([placement="start"]) .drawer-panel:not(.open) {
          transform: translateX(-100%);
        }
        :host([placement="end"]) .drawer-panel:not(.open) {
          transform: translateX(100%);
        }
        :host([placement="start"]) .drawer-panel.open,
        :host([placement="end"]) .drawer-panel.open {
          transform: translateX(0);
        }
        .drawer-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }
        @media (prefers-color-scheme: dark) {
          .drawer-panel {
            background: #171717;
          }
          .drawer-panel {
            border-color: #262626 !important;
          }
        }
      </style>
    `);
  }

  protected _onAttributeChange(name: string, value: string | null): void {
    if (name === "open") {
      if (value === null) {
        this.#onClose();
      } else {
        this.#onOpen();
      }
    }
  }

  #onOpen(): void {
    // Store previously focused element
    this.#previousFocus = document.activeElement as HTMLElement;

    // Add keyboard listener
    document.addEventListener("keydown", this.#handleKeyDown);

    // Focus first focusable element after a short delay to allow rendering
    requestAnimationFrame(() => {
      this.#trapFocus();
    });
  }

  #onClose(): void {
    // Remove keyboard listener
    document.removeEventListener("keydown", this.#handleKeyDown);

    // Return focus to trigger element
    if (this.#previousFocus?.focus) {
      this.#previousFocus.focus();
      this.#previousFocus = null;
    }
  }

  #onKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape" && this.open) {
      e.preventDefault();
      this.open = false;
      this._emit("mad-close", {});
    }
  }

  #onOverlayClick(ev: Event): void {
    // Only close if clicking the overlay background itself, not child elements
    if (ev.target !== ev.currentTarget) {
      return;
    }

    this.open = false;
    this._emit("mad-close", {});
  }

  #trapFocus(): void {
    const renderRoot = this._renderRoot;
    const panel = renderRoot.querySelector<HTMLElement>("[data-panel]");
    if (!panel) {
      return;
    }

    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    const focusableElements =
      panel.querySelectorAll<HTMLElement>(focusableSelectors);

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      // If no focusable elements, focus the panel itself
      panel.focus();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.#handleKeyDown);
  }
}

customElements.define("mad-drawer", MadDrawer);
