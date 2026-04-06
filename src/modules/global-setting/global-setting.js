export class GlobalSetting {
  STORE_KEY;
  alreadyInit;
  devicePrefersDark; // Device system setting
  darkModeSet; // The user choice
  darkThemeChangeCallbacks;
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
  toggleDarkTheme(shouldBeDark, fromDevice = false) {
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
  storeSetting(shouldBeDark) {
    this.darkModeSet = shouldBeDark;
    localStorage.setItem(
      this.STORE_KEY,
      JSON.stringify({ darkMode: this.darkModeSet })
    );
  }
  getStoredSetting() {
    const storedStr = localStorage.getItem(this.STORE_KEY);
    if (!storedStr) {
      return null;
    }
    return JSON.parse(storedStr);
  }
  execDarkThemeChangeCallbacks() {
    for (const callback of this.darkThemeChangeCallbacks) {
      setTimeout(() => {
        callback(this.isDarkThemeActive());
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
  onDarkThemeChange(callback) {
    this.darkThemeChangeCallbacks.push(callback);
  }
}
const setting = new GlobalSetting();
export default setting;
