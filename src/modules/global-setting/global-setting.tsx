import { SettingStorageData } from './global-setting.d';

export class GlobalSetting {
  private readonly STORE_KEY: string;
  private alreadyInit: boolean;
  private prefersDark: boolean; // Device system setting
  private darkModeSet: boolean | null; // The user choice
  private darkThemeChangeCallbacks: Function[];

  constructor() {
    this.STORE_KEY = 'CONTEST_ORGANIZER_SETTING';

    this.darkThemeChangeCallbacks = [];
    this.alreadyInit = false;
    this.prefersDark = false;
    this.darkModeSet = null; // Not a user choice yet
  }

  init() {
    if (this.alreadyInit) {
      return;
    }

    // Use matchMedia to check the user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark) {
      this.prefersDark = prefersDark.matches;
    }

    const stored = this.getStoredSetting();
    console.log('stored: ', stored);
    if (stored && stored.darkMode !== undefined) {
      this.toggleDarkTheme(stored.darkMode, true);
    } else {
      this.toggleDarkTheme(this.prefersDark, true);
    }

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', mediaQuery => this.toggleDarkTheme(mediaQuery.matches, true));

    // Init only once.
    this.alreadyInit = true;
  }

  // Add or remove the "dark" class on the document body
  private toggleDarkTheme(shouldBeDark: boolean, fromDevice: boolean = false) {
    document.body.classList.toggle('dark', shouldBeDark);
    document.body.classList.toggle('light', !shouldBeDark);

    if (fromDevice) {
      this.prefersDark = shouldBeDark;
    } else {
      this.storeSetting(shouldBeDark);
    }

    this.execDarkThemeChangeCallbacks();
  }

  private storeSetting(shouldBeDark: boolean) {
    this.darkModeSet = shouldBeDark;

    localStorage.setItem(this.STORE_KEY, JSON.stringify({ darkMode: this.darkModeSet }));
  }

  private getStoredSetting() {
    const storedStr = localStorage.getItem(this.STORE_KEY);
    if (!storedStr) {
      return null;
    }

    return JSON.parse(storedStr) as SettingStorageData;
  }

  private execDarkThemeChangeCallbacks() {
    this.darkThemeChangeCallbacks.forEach(callback => {
      setTimeout(() => {
        callback(this.isDarkThemeActive());
      });
    });
  }

  public setDarkTheme(state: boolean = true) {
    this.toggleDarkTheme(state);
  }

  public isDarkThemeActive() {
    return this.darkModeSet === null ? this.isPreferDarkTheme() : this.darkModeSet;
  }

  public isPreferDarkTheme() {
    return this.prefersDark;
  }

  public onDarkThemeChange(callback: Function) {
    this.darkThemeChangeCallbacks.push(callback);
  }
}

const setting = new GlobalSetting();
export default setting;
