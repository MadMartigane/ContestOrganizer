import type SlSwitch from "@shoelace-style/shoelace/dist/components/switch/switch.js";
import { Component, Host, h, State } from "@stencil/core";
import setting, {
  type GlobalSetting,
} from "../../modules/global-setting/global-setting";

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
