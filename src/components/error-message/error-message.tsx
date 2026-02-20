import { Component, Host, h, Prop } from "@stencil/core";

@Component({
  tag: "error-message",
  styleUrl: "./error-message.css",
  shadow: false,
})
export class ErrorMessage {
  @Prop() message: string;
  @Prop() goHomeButton = true;

  render() {
    return (
      <Host>
        <sl-alert class="my-8" open variant="danger">
          <sl-icon class="text-5xl" name="bug" slot="icon" />
          <h1 class="text-danger">Erreur</h1>
          <strong class="container">{this.message}</strong>
        </sl-alert>
        {this.goHomeButton ? (
          <div class="grid-300">
            <sl-button href="#/home" size="large" variant="primary">
              <sl-icon name="house" slot="prefix" />
              <span>Retour à l’accueil</span>
            </sl-button>
          </div>
        ) : null}
      </Host>
    );
  }
}
