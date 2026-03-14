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
      <sl-breadcrumb>
        <sl-breadcrumb-item>
          <sl-icon class="text-2xl" name="4-circle"></sl-icon>
          <sl-icon class="text-2xl" name="0-circle"></sl-icon>
          <sl-icon class="text-2xl" name="4-circle"></sl-icon>
        </sl-breadcrumb-item>
      </sl-breadcrumb>

      <div class="page-content">
        <h1>404 - La page demandée n'existe pas.</h1>

        <sl-carousel autoplay loop pagination>
          <sl-carousel-item>
            <img alt="404 - Not found" height="300" src="/assets/img/undraw_page_not_found.svg" width="400" />
          </sl-carousel-item>
          <sl-carousel-item>
            <img alt="404 - Page abducted" height="300" src="/assets/img/undraw_taken.svg" width="400" />
          </sl-carousel-item>
        </sl-carousel>

        <div class="footer">
          <div class="grid-300">
            <sl-button href="#/home" size="large" variant="primary">
              <sl-icon name="house" slot="prefix"></sl-icon>
              <span slot="suffix">Accueil</span>
            </sl-button>

            <sl-button href="#/tournaments" size="large" variant="primary">
              <sl-icon name="trophy" slot="prefix"></sl-icon>
              <span slot="suffix">Tournois</span>
            </sl-button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("page-404", Page404);
