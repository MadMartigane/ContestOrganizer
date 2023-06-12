import { Component, Fragment, h } from "@stencil/core";
import apiSports from "../../modules/api-sports/api-sports";

@Component({
  tag: "page-home",
  styleUrl: "page-home.css",
  shadow: false,
})

export class PageHome {

  private async testApi() {
    console.log("TEST API !!");
    const team = await apiSports.searchTeam("chicago");
    console.log("TEAM: ", team);
  }

  render() {
    return (
      <Fragment>

        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Accueil</ion-title>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <ion-card color="light">

            <ion-card-header class="ion-text-center">
              <ion-card-title color="primary">Bienvenue !</ion-card-title>
            </ion-card-header>

        <ion-button onClick={() => this.testApi()}>Test !!</ion-button>
            <ion-card-content class="ion-text-center">
              <p>Retrouve tous tes tournois via le menu tout en bas et clique sur <ion-icon name="trophy-outline" size="small" color="warning"></ion-icon></p>
              <p><ion-img
                src="assets/img/menu_trophy_marker.jpg"
                alt="Image du menu, avec marqueur sur bouton"
                ></ion-img></p>
            </ion-card-content>

          </ion-card>
        </ion-content>

      </Fragment>
    );
  }

}
