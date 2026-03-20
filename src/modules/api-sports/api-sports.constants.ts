/**
 * Safely retrieves an environment variable from either import.meta.env (Vite)
 * or process.env (Node/Jest), ensuring cross-environment compatibility.
 */
const getEnvVar = (): string => {
  try {
    // Vite statically replaces import.meta.env.VITE_* in production
    // In dev, import.meta.env exists; in prod, only the specific property access is replaced
    const viteKey = import.meta.env.VITE_API_SPORTS_KEY;
    if (viteKey) {
      return viteKey;
    }
    // Check for process.env (Node/Tests)
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.VITE_API_SPORTS_KEY
    ) {
      return process.env.VITE_API_SPORTS_KEY;
    }
  } catch {
    // Fallback if access fails
  }

  return "";
};

export const API_SPORTS_KEY = getEnvVar();

export const LOCAL_STORAGE_TEAM_KEY = "API_SPORTS_CACHE_TEAMS_V2";

export const LOCAL_STORAGE_TEAM_KEY_LEGACY = "API_SPORTS_CACHE_TEAMS";

export const LEGACY_CACHE_KEYS = ["API_SPORTS_CACHE_TEAMS"];

export const URLS = {
  NFL: "https://v1.american-football.api-sports.io/",
  RUGBY: "https://v1.rugby.api-sports.io/",
  BASKET: "https://v1.basketball.api-sports.io/",
  FOOT: "https://v3.football.api-sports.io/",
  NBA: "https://v2.nba.api-sports.io/",
};
