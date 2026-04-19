// Reactive theme store using Svelte 5 runes.
// Module-level $state() is singleton — all importers share the same state.
// Manages dark/light mode with OS preference detection and localStorage persistence.

let darkMode = $state<boolean>(false);
let userHasManualChoice = $state<boolean>(false);
let initialized = false;
let mediaQuery: MediaQueryList | null = null;

function applyMode(dark: boolean): void {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-mode", dark ? "dark" : "light");
  }
}

function detectOsPreference(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function startOsPreferenceTracking(): void {
  if (typeof window === "undefined") {
    return;
  }
  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", handleOsPreferenceChange);
}

function stopOsPreferenceTracking(): void {
  if (mediaQuery) {
    mediaQuery.removeEventListener("change", handleOsPreferenceChange);
    mediaQuery = null;
  }
}

function handleOsPreferenceChange(e: MediaQueryListEvent): void {
  if (!userHasManualChoice) {
    darkMode = e.matches;
    applyMode(darkMode);
  }
}

// --- Public API ---

/**
 * Initialize theme system. Called once from root layout on mount.
 * Reads localStorage for manual preference, falls back to OS preference.
 * Guards against multiple init calls.
 */
export function initTheme(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  let storedDarkMode: boolean | undefined;

  try {
    const raw = localStorage.getItem("CONTEST_ORGANIZER_SETTING");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.darkMode === "boolean") {
        storedDarkMode = parsed.darkMode;
      }
    }
  } catch {
    // Corrupted or unavailable localStorage → fall through to OS detection
  }

  if (storedDarkMode === undefined) {
    darkMode = detectOsPreference();
    applyMode(darkMode);
    startOsPreferenceTracking();
  } else {
    darkMode = storedDarkMode;
    userHasManualChoice = true;
    applyMode(darkMode);
  }
}

/**
 * Manually set dark mode. Persists choice to localStorage.
 * Stops OS preference tracking after first manual choice.
 */
export function setDarkMode(dark: boolean): void {
  darkMode = dark;
  userHasManualChoice = true;
  applyMode(darkMode);
  stopOsPreferenceTracking();

  try {
    const raw = localStorage.getItem("CONTEST_ORGANIZER_SETTING");
    const settings = raw ? JSON.parse(raw) : {};
    settings.darkMode = dark;
    localStorage.setItem("CONTEST_ORGANIZER_SETTING", JSON.stringify(settings));
  } catch {
    // localStorage unavailable — theme applied in-memory only
  }
}

/** Toggle dark mode. Convenience wrapper around setDarkMode. */
export function toggleDarkMode(): void {
  setDarkMode(!darkMode);
}

/** Read the current dark mode state (reactive when used in components). */
export function getIsDarkMode(): boolean {
  return darkMode;
}

/** Whether user has made a manual theme choice. */
export function getUserHasManualChoice(): boolean {
  return userHasManualChoice;
}
