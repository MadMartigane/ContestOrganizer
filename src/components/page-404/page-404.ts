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
      <div class="page-content">
        <h1>404 - La page demandée n'existe pas.</h1>

        <wa-carousel autoplay loop pagination>
          <wa-carousel-item>
            <img alt="404 - Not found" height="300" src="/assets/img/undraw_page_not_found.svg" width="400" />
          </wa-carousel-item>
          <wa-carousel-item>
            <img alt="404 - Page abducted" height="300" src="/assets/img/undraw_taken.svg" width="400" />
          </wa-carousel-item>
        </wa-carousel>

        <div class="footer">
          <div class="grid-300">
            <wa-button href="#/home" size="large" variant="brand">
              <wa-icon name="house" slot="start"></wa-icon>
              <span slot="suffix">Accueil</span>
            </wa-button>

            <wa-button href="#/tournaments" size="large" variant="brand">
              <wa-icon name="trophy" slot="start"></wa-icon>
              <span slot="suffix">Tournois</span>
            </wa-button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("page-404", Page404);
