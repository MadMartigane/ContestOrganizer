import type WaSwitch from "@awesome.me/webawesome/dist/components/switch/switch.js";
import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
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
  private darkModeSwitch: WaSwitch | null = null;

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
      <div class="page-content">
        <h1>Configuration</h1>

        <wa-switch
          id="dark-mode-switch"
          ${isDarkModeActive ? "checked" : ""}
          size="large"
        >
          <span class="container">Mode sombre</span>
          <wa-icon name="highlights"></wa-icon>
        </wa-switch>

        <wa-divider></wa-divider>

        <div class="my-4">
          <h3>Cache des équipes</h3>
          <p class="text-neutral text-sm">
            Vide le cache des équipes si vous rencontrez des problèmes de
            recherche.
          </p>
          <wa-button
            id="clear-cache-btn"
            class="mt-2"
            size="medium"
            variant="warning"
          >
            <wa-icon name="trash" slot="start"></wa-icon>
            Vider le cache
          </wa-button>
          ${
            cacheCleared
              ? `
            <wa-callout class="mt-2" open variant="success">
              <wa-icon name="check2-circle" slot="start"></wa-icon>
              Le cache des équipes a été vidé.
            </wa-callout>
          `
              : ""
          }
        </div>

        <div class="footer">
          <div class="grid-300">
            <wa-button href="#/home" size="large" variant="brand">
              <wa-icon name="house" slot="start"></wa-icon>
              <span slot="end">Acceuil</span>
            </wa-button>

            <wa-button href="#/tournaments" size="large" variant="brand">
              <wa-icon name="trophy" slot="start"></wa-icon>
              <span slot="end">Tournois</span>
            </wa-button>
          </div>
        </div>
      </div>
    `;

    // Query DOM elements after render
    this.darkModeSwitch = this.querySelector("#dark-mode-switch");
    const clearCacheBtn = this.querySelector("#clear-cache-btn");

    // Setup event listeners
    if (this.darkModeSwitch) {
      this.darkModeSwitch.addEventListener("wa-change", () => {
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
