import { BaseElement } from "@core/base-element.js";

const breadcrumbTemplate = document.createElement("template");
breadcrumbTemplate.innerHTML = `
  <style>
    :host { display: block; }
  </style>
  <nav part="base" class="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
    <slot></slot>
  </nav>
`;

const separatorSvg = `<svg class="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`;

export class MadBreadcrumb extends BaseElement {
  private _itemMutationObserver: MutationObserver | null = null;

  static get observedAttributes(): string[] {
    return [];
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._setupObserver();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._cleanupObserver();
  }

  private _setupObserver(): void {
    this._itemMutationObserver = new MutationObserver(() => {
      this._requestRender();
    });

    this._itemMutationObserver.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  private _cleanupObserver(): void {
    if (this._itemMutationObserver) {
      this._itemMutationObserver.disconnect();
      this._itemMutationObserver = null;
    }
  }

  protected _render(): void {
    const root = this._renderRoot;
    if (!root.firstChild) {
      root.appendChild(breadcrumbTemplate.content.cloneNode(true));
    }

    const nav = root.querySelector('[part="base"]');
    if (!nav) {
      return;
    }

    const items = Array.from(this.querySelectorAll("mad-breadcrumb-item"));
    nav.innerHTML = "";

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const href = item.getAttribute("href");
      const text = item.textContent?.trim() ?? "";
      const isLast = i === items.length - 1;

      let itemEl: HTMLElement;
      if (href && !isLast) {
        itemEl = document.createElement("a");
        itemEl.setAttribute("part", "link");
        itemEl.setAttribute("href", href);
        itemEl.className =
          "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200";
      } else {
        itemEl = document.createElement("span");
        itemEl.setAttribute("part", "current");
        itemEl.setAttribute("aria-current", "page");
        itemEl.className = "text-neutral-900 dark:text-neutral-100";
      }
      itemEl.textContent = text;

      nav.appendChild(itemEl);

      if (!isLast) {
        const sep = document.createElement("span");
        sep.setAttribute("part", "separator");
        sep.innerHTML = separatorSvg;
        nav.appendChild(sep);
      }
    }
  }
}

customElements.define("mad-breadcrumb", MadBreadcrumb);

export class MadBreadcrumbItem extends BaseElement {
  static get observedAttributes(): string[] {
    return ["href"];
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  protected _render(): void {
    // Content rendered by parent breadcrumb
  }
}

customElements.define("mad-breadcrumb-item", MadBreadcrumbItem);
