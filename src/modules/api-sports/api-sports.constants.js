export const LOCAL_STORAGE_TEAM_KEY = "api-sports-teams";
export const LEGACY_CACHE_KEYS = [
  "api-sports-cache",
  "api-sports-search-cache",
];
export const URLS = {
  BASKET: "https://v1.basketball.api-sports.io/",
  NBA: "https://v1.nba.api-sports.io/",
  NFL: "https://v1.americanfootball.api-sports.io/",
  RUGBY: "https://v1.rugby.api-sports.io/",
  FOOT: "https://v3.football.api-sports.io/",
};
const getApiKey = () => {
  const apiKey = window.APP_CONFIG?.API_SPORTS_KEY;
  if (!apiKey) {
    console.warn("[API-SPORTS] API_SPORTS_KEY is missing in window.APP_CONFIG");
    return "";
  }
  return apiKey;
};
export const API_SPORTS_KEY = getApiKey();
