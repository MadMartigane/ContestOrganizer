import { API_SPORTS_KEY as CONFIG_API_KEY } from "../../config";

// Re-export with the expected name for backward compatibility
export const API_SPORTS_KEY = CONFIG_API_KEY;

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
