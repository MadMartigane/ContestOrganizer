import { BaseElement } from "@core/base-element";
import { html } from "lit-html";

const separatorSvg = html`<svg class="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`;

interface BreadcrumbItemData {
  href: string | null;
  isLast: boolean;
  text: string;
}

/**
 * MadBreadcrumb - Navigation breadcrumb trail with automatic separator rendering
 *
 * Observed attributes: none
 *
 * @element mad-breadcrumb
 */
export class MadBreadcrumb extends BaseElement {
  private _itemMutationObserver: MutationObserver | null = null;

  static get observedAttributes() {
    return [] as const;
  }

  protected _setupProperties(): void {
    // No signals needed — properties handled via attributes/getters
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

  private _getBreadcrumbItems(): BreadcrumbItemData[] {
    const items = Array.from(this.querySelectorAll("mad-breadcrumb-item"));
    return items.map((item, index) => ({
      href: item.getAttribute("href"),
      text: item.textContent?.trim() ?? "",
      isLast: index === items.length - 1,
    }));
  }

  protected _render(): void {
    const items = this._getBreadcrumbItems();

    this._renderTemplate(html`
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

/**
 * MadBreadcrumbItem - Individual item within a breadcrumb trail
 *
 * Observed attributes:
 * - `href`: Optional link URL; last item renders as text without link
 *
 * @element mad-breadcrumb-item
 */
export class MadBreadcrumbItem extends BaseElement {
  static get observedAttributes() {
    return ["href"] as const;
  }

  protected _setupProperties(): void {
    // No signals needed — properties handled via attributes/getters
  }

  protected _render(): void {
    // Content rendered by parent breadcrumb
  }
}

customElements.define("mad-breadcrumb-item", MadBreadcrumbItem);
