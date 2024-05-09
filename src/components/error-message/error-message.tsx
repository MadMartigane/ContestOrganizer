import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'error-message',
  styleUrl: './error-message.css',
  shadow: false,
})
export class ErrorMessage {
  @Prop() message: string;
  @Prop() goHomeButton: boolean = true;

  render() {
    return (
      <Host>
        <sl-alert variant="danger" open class="my-8">
          <sl-icon slot="icon" class="text-5xl" name="bug"></sl-icon>
          <h1 class="text-danger">Erreur</h1>
          <strong class="container">{this.message}</strong>
        </sl-alert>
        {this.goHomeButton ? (
          <div class="grid-300">
            <sl-button variant="primary" href="#/home" size="large">
              <sl-icon slot="prefix" name="house"></sl-icon>
              <span>Retour à l’accueil</span>
            </sl-button>
          </div>
        ) : null}
      </Host>
    );
  }
}
