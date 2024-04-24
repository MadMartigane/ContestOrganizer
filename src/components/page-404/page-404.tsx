import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'page-404',
  styleUrl: 'page-404.css',
  shadow: false,
})
export class Page404 {
  render() {
    return (
      <Host>
        <sl-breadcrumb>
          <sl-breadcrumb-item>
            <sl-icon name="4-circle" class="xl"></sl-icon>
            <sl-icon name="0-circle" class="xl"></sl-icon>
            <sl-icon name="4-circle" class="xl"></sl-icon>
          </sl-breadcrumb-item>
        </sl-breadcrumb>

        <div class="page-content">
          <h1>404 - La page demandée n’existe pas.</h1>

          <sl-carousel autoplay loop pagination>
            <sl-carousel-item>
              <img alt="404 - Not found" src="/assets/img/undraw_page_not_found.svg" />
            </sl-carousel-item>
            <sl-carousel-item>
              <img alt="404 - Page abducted" src="/assets/img/undraw_taken.svg" />
            </sl-carousel-item>
          </sl-carousel>

          <div class="footer">
            <div class="grid-300">
              <sl-button variant="primary" href="#/home" size="large">
                <sl-icon name="house" slot="prefix"></sl-icon>
                <span slot="suffix">Accueil</span>
              </sl-button>

              <sl-button variant="primary" href="#/tournaments" size="large">
                <sl-icon name="trophy" slot="prefix"></sl-icon>
                <span slot="suffix">Tournois</span>
              </sl-button>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
