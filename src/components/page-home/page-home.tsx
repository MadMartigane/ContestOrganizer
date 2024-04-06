import { Component, Fragment, h, State } from '@stencil/core';
import setting, { GlobalSetting } from '../../modules/global-setting/global-setting';

import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.js';

@Component({
  tag: 'page-home',
  styleUrl: 'page-home.css',
  shadow: false,
})
export class PageHome {
  private readonly globalSetting: GlobalSetting;

  private darkModeSwitch: SlSwitch;
  private initialDarkModeActivated: boolean;

  @State() isDarkModeActive: boolean;

  constructor() {
    this.globalSetting = setting;

    this.initialDarkModeActivated = this.globalSetting.isDarkThemeActive();
    this.isDarkModeActive = this.globalSetting.isDarkThemeActive();
  }

  private installEventHandler() {
    if (this.darkModeSwitch) {
      this.darkModeSwitch.addEventListener('sl-change', () => {
        this.onDarkModeChange();
      });
    }
  }

  private onDarkModeChange() {
    this.globalSetting.setDarkTheme(this.darkModeSwitch.checked);
    this.isDarkModeActive = this.darkModeSwitch.checked;
  }

  public componentDidLoad() {
    this.installEventHandler();
  }

  render() {
    return (
      <Fragment>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Accueil</ion-title>
            <sl-switch ref={(el: SlSwitch) => (this.darkModeSwitch = el)} checked={this.initialDarkModeActivated} size="large">
              <sl-icon name="highlights"></sl-icon>
            </sl-switch>
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
