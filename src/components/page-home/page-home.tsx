import { Component, Fragment, h } from "@stencil/core";

@Component({
  tag: "page-home",
  styleUrl: "page-home.css",
  shadow: false,
})

export class PageHome {

  render() {
    return (
      <Fragment>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Accueil</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-text
            color="primary">Bienvenue !</ion-text>
        </ion-content>
      </Fragment>
    );
  }

}
