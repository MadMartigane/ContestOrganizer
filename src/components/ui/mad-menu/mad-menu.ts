import { BaseElement } from "@core/base-element.js";

const menuTemplate = document.createElement("template");
menuTemplate.innerHTML = `
  <style>
    :host { display: block; }
    :host([hidden]) { display: none; }
    .menu-container {
      outline: none;
    }
    .menu-container:focus-visible {
      outline: 2px solid #f97316;
      outline-offset: 2px;
    }
  </style>
  <div part="base" class="divide-y divide-neutral-200 dark:divide-neutral-700 menu-container" role="menu" aria-label="Menu">
    <slot></slot>
  </div>
`;

const menuItemTemplate = document.createElement("template");
menuItemTemplate.innerHTML = `
  <style>
    :host { display: block; }
  </style>
  <div part="base" class="flex items-center justify-between gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors" role="menuitem" tabindex="-1">
    <slot></slot>
    <slot name="end"></slot>
  </div>
`;

interface MenuItemElement extends HTMLElement {
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean
  ): void;
}

export class MadMenu extends BaseElement {
  private readonly _itemClickListeners: WeakMap<
    HTMLElement,
    (e: Event) => void
  > = new WeakMap();

  static get observedAttributes(): string[] {
    return [];
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._attachItemListeners();
    this._setupKeyboardNavigation();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._detachItemListeners();
  }

  /**
   * Set up keyboard navigation for the menu
   */
  private _setupKeyboardNavigation(): void {
    this.addEventListener("keydown", this._handleKeydown);
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

  private _attachItemListeners(): void {
    const items = Array.from(
      this._renderRoot.querySelectorAll<MenuItemElement>("mad-menu-item")
    );

    for (const item of items) {
      if (!this._itemClickListeners.has(item)) {
        const listener = (e: Event) => {
          e.preventDefault();
          this._emit("mad-select", { item });
        };
        this._itemClickListeners.set(item, listener);
        item.addEventListener("click", listener);
      }
    }
  }

  private _detachItemListeners(): void {
    const items = Array.from(
      this._renderRoot.querySelectorAll<MenuItemElement>("mad-menu-item")
    );

    for (const item of items) {
      const listener = this._itemClickListeners.get(item);
      if (listener) {
        item.removeEventListener("click", listener);
        this._itemClickListeners.delete(item);
      }
    }
  }

  protected _render(): void {
    const root = this._renderRoot;
    if (!root.firstChild) {
      root.appendChild(menuTemplate.content.cloneNode(true));
    }
  }
}

customElements.define("mad-menu", MadMenu);

export class MadMenuItem extends BaseElement {
  static get observedAttributes(): string[] {
    return [];
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  protected _render(): void {
    const root = this._renderRoot;
    if (!root.firstChild) {
      root.appendChild(menuItemTemplate.content.cloneNode(true));
    }
  }
}

customElements.define("mad-menu-item", MadMenuItem);
