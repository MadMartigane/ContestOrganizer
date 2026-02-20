import { Component, Host, h } from "@stencil/core";

@Component({
  tag: "page-404",
  styleUrl: "page-404.css",
  shadow: false,
})
export class Page404 {
  render() {
    return (
      <Host>
        <sl-breadcrumb>
          <sl-breadcrumb-item>
            <sl-icon class="text-2xl" name="4-circle" />
            <sl-icon class="text-2xl" name="0-circle" />
            <sl-icon class="text-2xl" name="4-circle" />
          </sl-breadcrumb-item>
        </sl-breadcrumb>

        <div class="page-content">
          <h1>404 - La page demandée n’existe pas.</h1>

          <sl-carousel autoplay loop pagination>
            <sl-carousel-item>
              <img
                alt="404 - Not found"
                src="/assets/img/undraw_page_not_found.svg"
              />
            </sl-carousel-item>
            <sl-carousel-item>
              <img
                alt="404 - Page abducted"
                src="/assets/img/undraw_taken.svg"
              />
            </sl-carousel-item>
          </sl-carousel>

          <div class="footer">
            <div class="grid-300">
              <sl-button href="#/home" size="large" variant="primary">
                <sl-icon name="house" slot="prefix" />
                <span slot="suffix">Accueil</span>
              </sl-button>

              <sl-button href="#/tournaments" size="large" variant="primary">
                <sl-icon name="trophy" slot="prefix" />
                <span slot="suffix">Tournois</span>
              </sl-button>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
