/**
 * Page404 component - Displays a 404 error page with navigation options
 * @module components/page-404
 */

import { BaseElement } from "@core/base-element.js";

export class Page404 extends BaseElement {
  /**
   * Sets up component properties (none needed for this component)
   */
  protected _setupProperties(): void {
    // No properties to set up
  }

  /**
   * Renders the 404 page content
   */
  protected _render(): void {
    this.innerHTML = `
      <div class="max-w-[1280px] px-4 mx-auto my-12 text-center bg-neutral-100 rounded-lg shadow-md">
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
    `;
  }
}

customElements.define("page-404", Page404);
