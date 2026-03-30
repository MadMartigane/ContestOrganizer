import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
import type SlSwitch from "@shoelace-style/shoelace/dist/components/switch/switch.js";
import setting, {
  type GlobalSetting,
} from "../../modules/global-setting/global-setting.js";

const API_SPORTS_CACHE_KEY = "API_SPORTS_CACHE_TEAMS";

/**
 * PageConfig - Configuration page with dark mode toggle and cache management
 * @element page-config
 */
export class PageConfig extends BaseElement {
  private declare globalSetting: GlobalSetting;
  private darkModeSwitch: SlSwitch | null = null;

  private declare _isDarkModeActive: Signal<boolean>;
  private declare _cacheCleared: Signal<boolean>;

  protected _setupProperties(): void {
    this.globalSetting = setting;
    this._isDarkModeActive = new Signal<boolean>(
      this.globalSetting.isDarkThemeActive()
    );
    this._cacheCleared = new Signal<boolean>(false);

    this._trackSignal(this._isDarkModeActive);
    this._trackSignal(this._cacheCleared);
  }

  private _onDarkModeChange(): void {
    if (this.darkModeSwitch) {
      const isDark = this.darkModeSwitch.checked;
      this.globalSetting.setDarkTheme(isDark);
      this._isDarkModeActive.value = isDark;
    }
  }

  private _clearCache(): void {
    localStorage.removeItem(API_SPORTS_CACHE_KEY);
    this._cacheCleared.value = true;
    setTimeout(() => {
      this._cacheCleared.value = false;
    }, 3000);
  }

  connectedCallback(): void {
    super.connectedCallback();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  protected _render(): void {
    const isDarkModeActive = this.globalSetting.isDarkThemeActive();
    const cacheCleared = this._cacheCleared.value;

    this.innerHTML = `
      <sl-breadcrumb>
        <sl-breadcrumb-item>
          <sl-icon class="text-2xl" name="gear"></sl-icon>
        </sl-breadcrumb-item>
      </sl-breadcrumb>

      <div class="page-content">
        <h1>Configuration</h1>

        <sl-switch
          id="dark-mode-switch"
          ${isDarkModeActive ? "checked" : ""}
          size="large"
        >
          <span class="container">Mode sombre</span>
          <sl-icon name="highlights"></sl-icon>
        </sl-switch>

        <sl-divider></sl-divider>

        <div class="my-4">
          <h3>Cache des équipes</h3>
          <p class="text-neutral text-sm">
            Vide le cache des équipes si vous rencontrez des problèmes de
            recherche.
          </p>
          <sl-button
            id="clear-cache-btn"
            class="mt-2"
            size="medium"
            variant="warning"
          >
            <sl-icon name="trash" slot="prefix"></sl-icon>
            Vider le cache
          </sl-button>
          ${
            cacheCleared
              ? `
            <sl-alert class="mt-2" open variant="success">
              <sl-icon name="check2-circle" slot="icon"></sl-icon>
              Le cache des équipes a été vidé.
            </sl-alert>
          `
              : ""
          }
        </div>

        <div class="footer">
          <div class="grid-300">
            <sl-button href="#/home" size="large" variant="primary">
              <sl-icon name="house" slot="prefix"></sl-icon>
              <span slot="suffix">Acceuil</span>
            </sl-button>

            <sl-button href="#/tournaments" size="large" variant="primary">
              <sl-icon name="trophy" slot="prefix"></sl-icon>
              <span slot="suffix">Tournois</span>
            </sl-button>
          </div>
        </div>
      </div>
    `;

    // Query DOM elements after render
    this.darkModeSwitch = this.querySelector("#dark-mode-switch");
    const clearCacheBtn = this.querySelector("#clear-cache-btn");

    // Setup event listeners
    if (this.darkModeSwitch) {
      this.darkModeSwitch.addEventListener("sl-change", () => {
        this._onDarkModeChange();
      });
    }

    if (clearCacheBtn) {
      clearCacheBtn.addEventListener("click", () => {
        this._clearCache();
      });
    }
  }
}

customElements.define("page-config", PageConfig);
