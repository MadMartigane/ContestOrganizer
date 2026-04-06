import { BaseElement } from "@core/base-element";
import { createComponentSheet } from "@core/styles";
import { html } from "lit-html";

const menuSheet = createComponentSheet(`
  .menu-container {
    outline: none;
    &:focus-visible {
      outline: 2px solid #f97316;
      outline-offset: 2px;
    }
  }
`);

/**
 * MadMenu - Keyboard-navigable menu container with ARIA menu pattern
 *
 * Observed attributes: none
 *
 * Keyboard: ArrowUp/ArrowDown to navigate, Home/End to jump
 *
 * @element mad-menu
 */
export class MadMenu extends BaseElement {
  static get observedAttributes() {
    return [] as const;
  }

  protected _setupProperties(): void {
    // No signals needed — properties handled via attributes/getters
  }

  protected _injectStyles(): void {
    super._injectStyles(menuSheet);
  }

  /**
   * Handle keyboard navigation
   */
  private readonly _handleKeydown = (event: KeyboardEvent): void => {
    const menu = this._renderRoot.querySelector('[role="menu"]');
    if (!menu) {
      return;
    }

    const items = Array.from(
      menu.querySelectorAll('[role="menuitem"]')
    ) as HTMLElement[];
    const focusedIndex = items.findIndex((item) =>
      item.contains(document.activeElement)
    );

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const nextIndex = focusedIndex + 1;
        if (nextIndex < items.length) {
          items[nextIndex].focus();
        } else if (items.length > 0) {
          items[0].focus();
        }
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        const prevIndex = focusedIndex - 1;
        if (prevIndex >= 0) {
          items[prevIndex].focus();
        } else if (items.length > 0) {
          items.at(-1)?.focus();
        }
        break;
      }
      case "Home": {
        event.preventDefault();
        if (items.length > 0) {
          items[0].focus();
        }
        break;
      }
      case "End": {
        event.preventDefault();
        if (items.length > 0) {
          items.at(-1)?.focus();
        }
        break;
      }
      default:
        break;
    }
  };

  protected _render(): void {
    this._renderTemplate(
      html` <div
        part="base"
        class="divide-y divide-neutral-200 dark:divide-neutral-700 menu-container"
        role="menu"
        aria-label="Menu"
        @keydown=${this._handleKeydown}
      >
        <slot></slot>
      </div>`
    );
  }
}

customElements.define("mad-menu", MadMenu);

/**
 * MadMenuItem - Individual selectable item within a menu
 *
 * Observed attributes: none
 *
 * Custom events:
 * - `mad-select`: Fired when item is clicked, detail: { item: MadMenuItem }
 *
 * @element mad-menu-item
 */
export class MadMenuItem extends BaseElement {
  static get observedAttributes() {
    return [] as const;
  }

  protected _setupProperties(): void {
    // No signals needed — properties handled via attributes/getters
  }

  /**
   * Handle click on menu item - emit selection event
   */
  private readonly _handleClick = (): void => {
    this._emit("mad-select", { item: this });
  };

  protected _render(): void {
    this._renderTemplate(
      html` <div
        part="base"
        class="flex items-center justify-between gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
        role="menuitem"
        tabindex="-1"
        @click=${this._handleClick}
      >
        <slot></slot>
        <slot name="end"></slot>
      </div>`
    );
  }
}

customElements.define("mad-menu-item", MadMenuItem);
