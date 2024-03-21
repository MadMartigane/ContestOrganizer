import { ToggleCustomEvent, ToggleChangeEventDetail } from '@ionic/core';
import { Component, Event, EventEmitter, Fragment, h } from '@stencil/core';

@Component({
  tag: 'page-home',
  styleUrl: 'page-home.css',
  shadow: false,
})
export class PageHome {
  @Event() darkModeChange: EventEmitter<boolean>;

  onDarkModeChange(eventDetail: ToggleChangeEventDetail<any> | null) {
    console.log('eventDetail: ', eventDetail);

    //this.darkModeChange.emit(eventTarget.checked);
  }

  render() {
    return (
      <Fragment>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Accueil</ion-title>
            <ion-toggle
              label-placement="start"
              enable-on-off-labels="true"
              id="themeToggle"
              justify="end"
              color="secondary"
              onChange={(ev: ToggleCustomEvent<any>) => this.onDarkModeChange(ev.detail)}
            >
              Dark Mode
            </ion-toggle>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <ion-card color="light">
            <ion-card-header class="ion-text-center">
              <ion-card-title color="primary">Bienvenue !</ion-card-title>
            </ion-card-header>

            <ion-card-content class="ion-text-center">
              <p>
                Retrouve tous tes tournois via le menu tout en bas et clique sur <mad-icon name="trophy" s warning></mad-icon>
              </p>
              <p>
                <ion-img src="assets/img/menu_trophy_marker.jpg" alt="Image du menu, avec marqueur sur bouton"></ion-img>
              </p>
            </ion-card-content>
          </ion-card>
        </ion-content>
      </Fragment>
    );
  }
}
