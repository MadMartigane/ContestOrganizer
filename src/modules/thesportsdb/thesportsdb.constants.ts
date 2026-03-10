// API endpoint for NBA teams
export const THESPORTSDB_API_URL =
  "https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=NBA";

// localStorage cache key
export const THESPORTSDB_CACHE_KEY = "THESPORTSDB_NBA_CACHE_V1";

// Cache duration: 7 days in milliseconds
export const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

// Cache schema version
export const CACHE_VERSION = 1;

// Image size suffix for TheSportsDB images
// Options: /tiny (50px), /small (250px), /medium (500px), none (original ~720px)
export const IMAGE_SIZE_SUFFIX = "/small"; // 250px - ideal for 64px display with retina
