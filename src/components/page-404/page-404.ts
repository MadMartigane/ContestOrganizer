import { BaseElement } from "@core/base-element";
import { createComponentSheet } from "@core/styles";
import { html, type TemplateResult } from "lit-html";
import page404Styles from "./page-404.css?raw";

const page404Sheet = createComponentSheet(page404Styles);

/**
 * Page404 - 404 error page component with navigation options
 *
 * Observed attributes: none
 *
 * Custom events: none
 *
 * @element page-404
 */
export class Page404 extends BaseElement {
  /**
   * Called when the element is added to the DOM
   */
  connectedCallback(): void {
    super.connectedCallback();
  }

  protected _injectStyles(): void {
    super._injectStyles(page404Sheet);
  }

  protected _setupProperties(): void {
    // No properties to set up
  }

  private _renderContent(): TemplateResult {
    return html`
      <div part="base">
        <div class="max-w-[1280px] px-4 mx-auto my-12 text-center bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
          <h1>404 - La page demandée n'existe pas.</h1>

          <div class="flex justify-center items-center py-8">
            <img alt="404 - Not found" height="300" src="/assets/img/undraw_page_not_found.svg" width="400" />
          </div>

          <div class="footer">
            <div class="grid-300">
              <mad-button href="#/home" size="large" variant="brand">
                <mad-icon name="house" slot="start"></mad-icon>
                <span slot="suffix">Accueil</span>
              </mad-button>

              <mad-button href="#/tournaments" size="large" variant="brand">
                <mad-icon name="trophy" slot="start"></mad-icon>
                <span slot="suffix">Tournois</span>
              </mad-button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renders the 404 page content
   */
  protected _render(): void {
    this._renderTemplate(this._renderContent());
  }
}

customElements.define("page-404", Page404);
