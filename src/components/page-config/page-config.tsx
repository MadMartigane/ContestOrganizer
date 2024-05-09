import { Component, Host, h, State } from '@stencil/core';
import setting, { GlobalSetting } from '../../modules/global-setting/global-setting';

import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.js';

@Component({
  tag: 'page-config',
  styleUrl: 'page-config.css',
  shadow: false,
})
export class PageConfig {
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
      <Host>
        <sl-breadcrumb>
          <sl-breadcrumb-item>
            <sl-icon name="gear" class="text-2xl"></sl-icon>
          </sl-breadcrumb-item>
        </sl-breadcrumb>

        <div class="page-content">
          <h1>Configuration</h1>

          <sl-switch ref={(el: SlSwitch) => (this.darkModeSwitch = el)} checked={this.initialDarkModeActivated} size="large">
            <span class="container">Mode sombre</span>
            <sl-icon name="highlights"></sl-icon>
          </sl-switch>

          <div class="footer">
            <div class="grid-300">
              <sl-button variant="primary" href="#/home" size="large">
                <sl-icon name="house" slot="prefix"></sl-icon>
                <span slot="suffix">Acceuil</span>
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
