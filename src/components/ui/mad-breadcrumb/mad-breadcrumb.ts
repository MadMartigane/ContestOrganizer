import { BaseElement } from "@core/base-element.js";

export class MadBreadcrumb extends BaseElement {
  static get observedAttributes(): string[] {
    return [];
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  protected _render(): void {
    const items = Array.from(this.querySelectorAll("mad-breadcrumb-item"));
    const itemsHtml = items
      .map((item, i) => {
        const href = item.getAttribute("href");
        const text = item.textContent?.trim() ?? "";
        const isLast = i === items.length - 1;
        if (href && !isLast) {
          return `<a href="${href}" class="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">${text}</a>`;
        }
        return `<span class="text-neutral-900 dark:text-neutral-100" aria-current="page">${text}</span>`;
      })
      .join(
        '<svg class="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>'
      );

    this.innerHTML = `<nav class="flex items-center gap-2 text-sm" aria-label="Breadcrumb">${itemsHtml}</nav>`;
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
