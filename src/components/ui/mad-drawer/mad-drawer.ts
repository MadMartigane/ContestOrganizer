import { BaseElement } from "@core/base-element";
import { createComponentSheet } from "@core/styles";
import { html } from "lit-html";

const drawerSheet = createComponentSheet(`
  :host { isolation: isolate; }

  /* Popover backdrop */
  [popover]::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  .drawer-panel {
    position: fixed;
    top: 0;
    height: 100%;
    width: 20rem;
    max-width: 90vw;
    background: white;
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    border: none;
    margin: 0;
    padding: 0;

    @media (prefers-color-scheme: dark) {
      background: #171717;
    }
  }

  :host([placement="start"]) {
    & .drawer-panel {
      left: 0;
      border-right: 1px solid rgb(229, 229, 229);
      transform: translateX(-100%);
      transition: transform 0.3s ease-out;

      @media (prefers-color-scheme: dark) {
        border-color: rgb(38, 38, 38);
      }
    }
  }

  :host([placement="end"]) {
    & .drawer-panel {
      right: 0;
      border-left: 1px solid rgb(229, 229, 229);
      transform: translateX(100%);
      transition: transform 0.3s ease-out;

      @media (prefers-color-scheme: dark) {
        border-color: rgb(38, 38, 38);
      }
    }
  }

  /* When open, slide into view */
  .drawer-panel:popover-open {
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
`);

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
  static get observedAttributes() {
    return ["open", "placement", "no-header"] as const;
  }

  #previousFocus: HTMLElement | null = null;

  protected _setupProperties(): void {
    // No signals needed — properties handled via attributes/getters
  }

  protected _injectStyles(): void {
    super._injectStyles(drawerSheet);
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
    this._renderTemplate(html`
      <div class="drawer-panel" popover="auto" data-panel part="panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabindex="-1">
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
    `);
  }

  protected _onAttributeChange(name: string, value: string | null): void {
    if (name === "open") {
      const update = (): void => {
        const panel =
          this._renderRoot.querySelector<HTMLElement>("[data-panel]");
        if (!panel) {
          return;
        }

        if (value === null) {
          this.#onClose();
          try {
            panel.hidePopover();
          } catch {
            /* not open */
          }
        } else {
          this.#onOpen();
          try {
            panel.showPopover();
          } catch {
            /* already open */
          }
        }
      };

      if (
        (
          document as Document & {
            startViewTransition?: (cb: () => void) => unknown;
          }
        ).startViewTransition
      ) {
        document.startViewTransition(() => update());
      } else {
        update();
      }
    }
  }

  #onOpen(): void {
    this.#previousFocus = document.activeElement as HTMLElement;
    requestAnimationFrame(() => {
      this.#trapFocus();
    });
  }

  #onClose(): void {
    if (this.#previousFocus?.focus) {
      this.#previousFocus.focus();
      this.#previousFocus = null;
    }
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
}

customElements.define("mad-drawer", MadDrawer);
