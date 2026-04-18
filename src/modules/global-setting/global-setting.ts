import type { SettingStorageData } from "./global-setting.types";

export class GlobalSetting {
  private readonly STORE_KEY: string;
  private alreadyInit: boolean;
  private devicePrefersDark: boolean; // Device system setting
  private darkModeSet: boolean | null; // The user choice
  private readonly darkThemeChangeCallbacks: {
    callback: (isDark: boolean) => void;
  }[];

  constructor() {
    this.STORE_KEY = "CONTEST_ORGANIZER_SETTING";

    this.darkThemeChangeCallbacks = [];
    this.alreadyInit = false;
    this.devicePrefersDark = false;
    this.darkModeSet = null; // Not a user choice yet
  }

  init() {
    if (this.alreadyInit) {
      return;
    }

    // Use matchMedia to check the user preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    if (prefersDark) {
      this.devicePrefersDark = prefersDark.matches;
    }

    const stored = this.getStoredSetting();
    if (stored && stored.darkMode !== undefined) {
      this.toggleDarkTheme(stored.darkMode, false);
    } else {
      this.toggleDarkTheme(this.devicePrefersDark, true);
    }

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener("change", (mediaQuery) =>
      this.toggleDarkTheme(mediaQuery.matches, true)
    );

    // Init only once.
    this.alreadyInit = true;
  }

  // Add or remove the "dark" class on the document body
  private toggleDarkTheme(shouldBeDark: boolean, fromDevice = false) {
    // Standard dark mode
    document.documentElement.classList.toggle("dark", shouldBeDark);
    document.documentElement.style.colorScheme = shouldBeDark
      ? "dark"
      : "light";

    if (fromDevice) {
      this.devicePrefersDark = shouldBeDark;
    } else {
      this.storeSetting(shouldBeDark);
    }

    this.execDarkThemeChangeCallbacks();
  }

  private storeSetting(shouldBeDark: boolean) {
    this.darkModeSet = shouldBeDark;

    localStorage.setItem(
      this.STORE_KEY,
      JSON.stringify({ darkMode: this.darkModeSet })
    );
  }

  private getStoredSetting() {
    const storedStr = localStorage.getItem(this.STORE_KEY);
    if (!storedStr) {
      return null;
    }

    return JSON.parse(storedStr) as SettingStorageData;
  }

  private execDarkThemeChangeCallbacks() {
    for (const entry of this.darkThemeChangeCallbacks) {
      setTimeout(() => {
        entry.callback(this.isDarkThemeActive());
      });
    }
  }

  setDarkTheme(state = true) {
    this.toggleDarkTheme(state);
  }

  isDarkThemeActive() {
    return this.darkModeSet === null
      ? this.isPreferDarkTheme()
      : this.darkModeSet;
  }

  isPreferDarkTheme() {
    return this.devicePrefersDark;
  }

  onDarkThemeChange(callback: (isDark: boolean) => void): () => void {
    const entry = { callback };
    this.darkThemeChangeCallbacks.push(entry);
    return () => {
      const index = this.darkThemeChangeCallbacks.indexOf(entry);
      if (index !== -1) {
        this.darkThemeChangeCallbacks.splice(index, 1);
      }
    };
  }
}

const setting = new GlobalSetting();
export default setting;
