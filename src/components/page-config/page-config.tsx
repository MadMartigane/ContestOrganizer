import type SlSwitch from "@shoelace-style/shoelace/dist/components/switch/switch.js";
import { Component, Host, h, State } from "@stencil/core";
import setting, {
  type GlobalSetting,
} from "../../modules/global-setting/global-setting";

const API_SPORTS_CACHE_KEY = "API_SPORTS_CACHE_TEAMS";

@Component({
  tag: "page-config",
  styleUrl: "page-config.css",
  shadow: false,
})
export class PageConfig {
  private readonly globalSetting: GlobalSetting;

  private darkModeSwitch: SlSwitch;
  private readonly initialDarkModeActivated: boolean;

  @State() isDarkModeActive: boolean;
  @State() cacheCleared = false;

  constructor() {
    this.globalSetting = setting;

    this.initialDarkModeActivated = this.globalSetting.isDarkThemeActive();
    this.isDarkModeActive = this.globalSetting.isDarkThemeActive();
  }

  private installEventHandler() {
    if (this.darkModeSwitch) {
      this.darkModeSwitch.addEventListener("sl-change", () => {
        this.onDarkModeChange();
      });
    }
  }

  private onDarkModeChange() {
    this.globalSetting.setDarkTheme(this.darkModeSwitch.checked);
    this.isDarkModeActive = this.darkModeSwitch.checked;
  }

  private clearCache() {
    localStorage.removeItem(API_SPORTS_CACHE_KEY);
    this.cacheCleared = true;
    setTimeout(() => {
      this.cacheCleared = false;
    }, 3000);
  }

  componentDidLoad() {
    this.installEventHandler();
  }

  render() {
    return (
      <Host>
        <sl-breadcrumb>
          <sl-breadcrumb-item>
            <sl-icon class="text-2xl" name="gear" />
          </sl-breadcrumb-item>
        </sl-breadcrumb>

        <div class="page-content">
          <h1>Configuration</h1>

          <sl-switch
            checked={this.initialDarkModeActivated}
            ref={(el: SlSwitch) => (this.darkModeSwitch = el)}
            size="large"
          >
            <span class="container">Mode sombre</span>
            <sl-icon name="highlights" />
          </sl-switch>

          <sl-divider />

          <div class="my-4">
            <h3>Cache des équipes</h3>
            <p class="text-neutral text-sm">
              Vide le cache des équipes si vous rencontrez des problèmes de
              recherche.
            </p>
            <sl-button
              class="mt-2"
              onclick={() => this.clearCache()}
              size="medium"
              variant="warning"
            >
              <sl-icon name="trash" slot="prefix" />
              Vider le cache
            </sl-button>
            {this.cacheCleared && (
              <sl-alert class="mt-2" open variant="success">
                <sl-icon name="check2-circle" slot="icon" />
                Le cache des équipes a été vidé.
              </sl-alert>
            )}
          </div>

          <div class="footer">
            <div class="grid-300">
              <sl-button href="#/home" size="large" variant="primary">
                <sl-icon name="house" slot="prefix" />
                <span slot="suffix">Acceuil</span>
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
