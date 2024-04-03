import { Component, Fragment, h, State } from '@stencil/core';
import setting, { GlobalSetting } from '../../modules/global-setting/global-setting';

import { Switch } from '@spectrum-web-components/switch';

@Component({
  tag: 'page-home',
  styleUrl: 'page-home.css',
  shadow: false,
})
export class PageHome {
  private readonly globalSetting: GlobalSetting;

  private darkModeSwitch: Switch;
  private initialDarkModeActivated: boolean;

  @State() isDarkModeActive: boolean;

  constructor() {
    this.globalSetting = setting;

    this.initialDarkModeActivated = this.globalSetting.isDarkThemeActive();
    this.isDarkModeActive = this.globalSetting.isDarkThemeActive();
    console.log('[PageHome] initialDarkModeActivated: ', this.initialDarkModeActivated);
    console.log('[PageHome] isDarkModeActive: ', this.isDarkModeActive);
  }

  onDarkModeChange() {
    this.globalSetting.setDarkTheme(this.darkModeSwitch.checked);
    this.isDarkModeActive = this.darkModeSwitch.checked;
  }

  render() {
    return (
      <Fragment>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Accueil</ion-title>
            <sp-theme scale="large" color="light">
              <sp-switch
                ref={(el: Switch) => (this.darkModeSwitch = el as Switch)}
                checked={this.initialDarkModeActivated}
                emphasized
                size="l"
                onchange={() => this.onDarkModeChange()}
              >
                {this.isDarkModeActive ? <mad-icon primary name="dark-mode"></mad-icon> : <mad-icon light name="dark-mode"></mad-icon>}
              </sp-switch>
            </sp-theme>
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
