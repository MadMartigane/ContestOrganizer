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
  private darkModeSwitch: HTMLElement | null = null;

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

  private _onDarkModeChange(event: CustomEvent<{ checked: boolean }>): void {
    const isDark = event.detail.checked;
    this.globalSetting.setDarkTheme(isDark);
    this._isDarkModeActive.value = isDark;
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
      <div class="max-w-[1280px] px-4 mx-auto my-12 text-center bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
        <h1 class="dark:text-neutral-100">Configuration</h1>

        <mad-switch
          id="dark-mode-switch"
          ${isDarkModeActive ? "checked" : ""}
          size="large"
        >
          <span class="container">Mode sombre</span>
          <mad-icon name="highlights"></mad-icon>
        </mad-switch>

        <hr class="my-4 border-neutral-200 dark:border-neutral-700">

        <div class="my-4">
          <h3 class="dark:text-neutral-100">Cache des équipes</h3>
          <p class="text-neutral-400 dark:text-neutral-500 text-sm">
            Vide le cache des équipes si vous rencontrez des problèmes de
            recherche.
          </p>
          <mad-button
            id="clear-cache-btn"
            class="mt-2"
            size="medium"
            variant="warning"
          >
            <mad-icon name="trash" slot="start"></mad-icon>
            Vider le cache
          </mad-button>
          ${
            cacheCleared
              ? `
            <mad-callout class="mt-2" open variant="success">
              <mad-icon name="check2-circle" slot="start"></mad-icon>
              Le cache des équipes a été vidé.
            </mad-callout>
          `
              : ""
          }
        </div>

        <div class="footer">
          <div class="grid-300">
            <mad-button href="#/home" size="large" variant="brand">
              <mad-icon name="house" slot="start"></mad-icon>
              <span slot="end">Acceuil</span>
            </mad-button>

            <mad-button href="#/tournaments" size="large" variant="brand">
              <mad-icon name="trophy" slot="start"></mad-icon>
              <span slot="end">Tournois</span>
            </mad-button>
          </div>
        </div>
      </div>
    `;

    // Query DOM elements after render
    this.darkModeSwitch = this.querySelector("#dark-mode-switch");
    const clearCacheBtn = this.querySelector("#clear-cache-btn");

    // Setup event listeners
    if (this.darkModeSwitch) {
      this.darkModeSwitch.addEventListener("mad-change", (e: Event) => {
        this._onDarkModeChange(e as CustomEvent<{ checked: boolean }>);
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
