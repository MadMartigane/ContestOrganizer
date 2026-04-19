import { STORAGE_KEY_SETTINGS } from "$lib/domain/constants";
import type { AppSettings } from "$lib/domain/types";

// ──────────────────────────────────────────────────
// Internal Helpers
// ──────────────────────────────────────────────────

const isLocalStorageAvailable = (): boolean => {
  try {
    const key = "__settings_test__";
    localStorage.setItem(key, "test");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

// ──────────────────────────────────────────────────
// Settings CRUD
// ──────────────────────────────────────────────────

/**
 * Load app settings from localStorage.
 * Returns default (empty) settings if unavailable or corrupted.
 */
export const loadSettings = (): AppSettings => {
  if (!isLocalStorageAvailable()) {
    return {};
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as AppSettings;
    }

    return {};
  } catch {
    console.warn("Corrupted settings in localStorage — resetting.");
    return {};
  }
};

/**
 * Save app settings to localStorage. Merges with existing settings.
 */
export const saveSettings = (partial: Partial<AppSettings>): void => {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const current = loadSettings();
    const merged = { ...current, ...partial };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(merged));
  } catch {
    console.warn("Failed to save settings to localStorage.");
  }
};

// ──────────────────────────────────────────────────
// Convenience Accessors
// ──────────────────────────────────────────────────

/** Get the stored dark mode preference. undefined = no manual preference. */
export const getStoredDarkMode = (): boolean | undefined =>
  loadSettings().darkMode;

/** Persist dark mode preference. */
export const setStoredDarkMode = (dark: boolean): void => {
  saveSettings({ darkMode: dark });
};

/** Get the stored locale preference. */
export const getStoredLocale = (): string | undefined => loadSettings().locale;

/** Persist locale preference. */
export const setStoredLocale = (locale: string): void => {
  saveSettings({ locale });
};
