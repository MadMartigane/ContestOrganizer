import { BaseElement } from "@core/base-element.js";
import { html } from "lit-html";

const separatorSvg = html`<svg class="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`;
export class MadBreadcrumb extends BaseElement {
  _itemMutationObserver = null;
  static get observedAttributes() {
    return [];
  }
  _setupProperties() {
    this._initialized = true;
  }
  connectedCallback() {
    super.connectedCallback();
    this._setupObserver();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanupObserver();
  }
  _setupObserver() {
    this._itemMutationObserver = new MutationObserver(() => {
      this._requestRender();
    });
    this._itemMutationObserver.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }
  _cleanupObserver() {
    if (this._itemMutationObserver) {
      this._itemMutationObserver.disconnect();
      this._itemMutationObserver = null;
    }
  }
  _getBreadcrumbItems() {
    const items = Array.from(this.querySelectorAll("mad-breadcrumb-item"));
    return items.map((item, index) => ({
      href: item.getAttribute("href"),
      text: item.textContent?.trim() ?? "",
      isLast: index === items.length - 1,
    }));
  }
  _render() {
    const items = this._getBreadcrumbItems();
    this._renderTemplate(html`
      <style>
        :host { display: block; }
      </style>
      <nav part="base" class="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        ${items.map((item) => {
          if (item.href && !item.isLast) {
            return html`
              <a part="link" href="${item.href}" class="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">${item.text}</a>
              ${separatorSvg}
            `;
          }
          return html`
            <span part="current" aria-current="page" class="text-neutral-900 dark:text-neutral-100">${item.text}</span>
          `;
        })}
      </nav>
    `);
  }
}
customElements.define("mad-breadcrumb", MadBreadcrumb);
export class MadBreadcrumbItem extends BaseElement {
  static get observedAttributes() {
    return ["href"];
  }
  _setupProperties() {
    this._initialized = true;
  }
  _render() {
    // Content rendered by parent breadcrumb
  }
}
customElements.define("mad-breadcrumb-item", MadBreadcrumbItem);
