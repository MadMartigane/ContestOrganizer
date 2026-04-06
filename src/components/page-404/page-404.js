import { BaseElement } from "@core/base-element.js";
import { html } from "lit-html";
import page404Styles from "./page-404.css?raw";
/**
 * Page404 component - Displays a 404 error page with navigation options
 * @module components/page-404
 */
export class Page404 extends BaseElement {
  /**
   * Called when the element is added to the DOM
   */
  connectedCallback() {
    super.connectedCallback();
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(page404Styles);
    this._injectStyles(sheet);
  }
  /**
   * Sets up component properties (none needed for this component)
   */
  _setupProperties() {
    // No properties to set up
  }
  _getStyles() {
    return html`
      <style>
        :host { display: block; }
      </style>
    `;
  }
  _renderContent() {
    return html`
      ${this._getStyles()}
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
  _render() {
    this._renderTemplate(this._renderContent());
  }
}
customElements.define("page-404", Page404);
