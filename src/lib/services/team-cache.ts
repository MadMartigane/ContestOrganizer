import type { GenericTeam, TournamentType } from "$lib/domain/types";

// ──────────────────────────────────────────────────
// Cache Configuration
// ──────────────────────────────────────────────────

const CACHE_KEY = "CONTEST_ORGANIZER_TEAM_CACHE_V2";
const NBA_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

interface CacheEntry {
  query: string;
  sportType: TournamentType;
  teams: GenericTeam[];
  timestamp: number;
}

interface TeamCache {
  entries: Record<string, CacheEntry>;
  nbaAllTeams?: GenericTeam[];
  nbaAllTeamsTimestamp?: number;
}

// ──────────────────────────────────────────────────
// Internal Helpers
// ──────────────────────────────────────────────────

const loadCache = (): TeamCache => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return { entries: {} };
    }
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && "entries" in parsed) {
      return parsed as TeamCache;
    }
    return { entries: {} };
  } catch {
    return { entries: {} };
  }
};

const saveCache = (cache: TeamCache): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    console.warn("Failed to save team cache to localStorage.");
  }
};

const getCacheKey = (sportType: TournamentType, query: string): string =>
  `${sportType}:${query.toLowerCase().trim()}`;

// ──────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────

/** Get cached teams for a search query. Returns null if not cached or expired. */
export const getCachedTeams = (
  sportType: TournamentType,
  query: string
): GenericTeam[] | null => {
  const cache = loadCache();

  // NBA: check full teams list first (with TTL)
  if (sportType === "NBA" && cache.nbaAllTeams) {
    if (cache.nbaAllTeamsTimestamp) {
      const age = Date.now() - cache.nbaAllTeamsTimestamp;
      if (age > NBA_CACHE_TTL) {
        return null; // Force re-fetch with fresh data (including logos)
      }
    }

    const lowerQuery = query.toLowerCase().trim();
    if (lowerQuery.length < 3) {
      return null;
    }
    return cache.nbaAllTeams.filter((team) =>
      team.name.toLowerCase().includes(lowerQuery)
    );
  }

  const key = getCacheKey(sportType, query);
  const entry = cache.entries[key];
  if (!entry) {
    return null;
  }

  // API-Sports: permanent cache (no TTL)
  return entry.teams;
};

/** Store teams in cache for a search query. */
export const setCachedTeams = (
  sportType: TournamentType,
  query: string,
  teams: GenericTeam[]
): void => {
  const cache = loadCache();
  const key = getCacheKey(sportType, query);
  cache.entries[key] = {
    query,
    sportType,
    teams,
    timestamp: Date.now(),
  };
  saveCache(cache);
};

/** Store all NBA teams (permanent cache with TTL for refresh). */
export const setCachedNbaAllTeams = (teams: GenericTeam[]): void => {
  const cache = loadCache();
  cache.nbaAllTeams = teams;
  cache.nbaAllTeamsTimestamp = Date.now();
  saveCache(cache);
};

/** Get all cached NBA teams. Returns null if not cached or expired (7-day TTL). */
export const getCachedNbaAllTeams = (): GenericTeam[] | null => {
  const cache = loadCache();
  if (!(cache.nbaAllTeams && cache.nbaAllTeamsTimestamp)) {
    return null;
  }

  const age = Date.now() - cache.nbaAllTeamsTimestamp;
  if (age > NBA_CACHE_TTL) {
    return null;
  }

  return cache.nbaAllTeams;
};

/** Check if NBA cache is expired but exists (for fallback). */
export const hasStaleNbaCache = (): boolean => {
  const cache = loadCache();
  if (!(cache.nbaAllTeams && cache.nbaAllTeamsTimestamp)) {
    return false;
  }
  return Date.now() - cache.nbaAllTeamsTimestamp > NBA_CACHE_TTL;
};

/** Get stale NBA cache (for fallback when API fails). */
export const getStaleNbaAllTeams = (): GenericTeam[] | null => {
  const cache = loadCache();
  return cache.nbaAllTeams ?? null;
};

/** Clear all team cache entries. Used by config page. */
export const clearTeamCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    console.warn("Failed to clear team cache.");
  }
};
