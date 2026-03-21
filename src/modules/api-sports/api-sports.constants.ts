// DEBUG: Remove after pre-prod diagnosis
/**
 * Safely retrieves an environment variable from either import.meta.env (Vite)
 * or process.env (Node/Jest), ensuring cross-environment compatibility.
 */
const getEnvVar = (): string => {
  try {
    // DEBUG: Remove after pre-prod diagnosis
    console.log("[API-SPORTS-DEBUG] import.meta.env:", import.meta.env);
    console.log(
      "[API-SPORTS-DEBUG] process.env:",
      typeof process !== "undefined" ? process.env : "process is undefined"
    );

    // Log each VITE_ prefixed key individually
    const viteEnvKeys = Object.keys(import.meta.env).filter((key) =>
      key.startsWith("VITE_")
    );
    for (const key of viteEnvKeys) {
      console.log(`[API-SPORTS-DEBUG] ${key}:`, import.meta.env[key]);
    }
    // Vite statically replaces import.meta.env.VITE_* in production
    // In dev, import.meta.env exists; in prod, only the specific property access is replaced
    const viteKey = import.meta.env.VITE_API_SPORTS_KEY;
    if (viteKey) {
      console.log(
        "[API-SPORTS-DEBUG] Returning from import.meta.env.VITE_API_SPORTS_KEY:",
        viteKey
      );
      return viteKey;
    }
    // Check for process.env (Node/Tests)
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.VITE_API_SPORTS_KEY
    ) {
      console.log(
        "[API-SPORTS-DEBUG] Returning from process.env.VITE_API_SPORTS_KEY:",
        process.env.VITE_API_SPORTS_KEY
      );
      return process.env.VITE_API_SPORTS_KEY;
    }
  } catch (_e) {
    // Fallback if access fails
  }

  console.log("[API-SPORTS-DEBUG] Returning empty string - no API key found");
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
