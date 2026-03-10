import httpRequest from "../http-request/http-request";
import { TournamentType } from "../tournaments/tournaments.types";
import {
  CACHE_DURATION_MS,
  CACHE_VERSION,
  IMAGE_SIZE_SUFFIX,
  THESPORTSDB_API_URL,
  THESPORTSDB_CACHE_KEY,
} from "./thesportsdb.constants";
import type {
  NbaTeam,
  TheSportsDbApiResponse,
  TheSportsDbNbaCache,
} from "./thesportsdb.types";

export class TheSportsDbService {
  private cache: TheSportsDbNbaCache | null = null;
  private readonly cacheLoaded: Promise<void>;

  constructor() {
    this.cacheLoaded = this.loadCache();
  }

  // Load cache from localStorage
  private loadCache(): Promise<void> {
    const cacheString = localStorage.getItem(THESPORTSDB_CACHE_KEY);

    if (!cacheString) {
      this.cache = null;
      return Promise.resolve();
    }

    try {
      const parsed = JSON.parse(cacheString) as TheSportsDbNbaCache;

      // Validate cache structure
      if (parsed.version === CACHE_VERSION && Array.isArray(parsed.teams)) {
        this.cache = parsed;
      } else {
        this.cache = null;
        localStorage.removeItem(THESPORTSDB_CACHE_KEY);
      }
    } catch (error) {
      console.warn("[TheSportsDbService] Failed to parse cache:", error);
      this.cache = null;
      localStorage.removeItem(THESPORTSDB_CACHE_KEY);
    }

    return Promise.resolve();
  }

  // Save cache to localStorage
  private saveCache(teams: NbaTeam[]): void {
    const cache: TheSportsDbNbaCache = {
      lastUpdated: Date.now(),
      teams,
      version: CACHE_VERSION,
    };

    localStorage.setItem(THESPORTSDB_CACHE_KEY, JSON.stringify(cache));
    this.cache = cache;
  }

  // Check if cache is still fresh (< 7 days)
  private isCacheFresh(): boolean {
    if (!this.cache) {
      return false;
    }
    return Date.now() - this.cache.lastUpdated < CACHE_DURATION_MS;
  }

  // Transform TheSportsDB URL to use size suffix
  private withSizeSuffix(url: string): string {
    if (!url) {
      return "";
    }
    if (url.endsWith(IMAGE_SIZE_SUFFIX)) {
      return url;
    }
    return `${url}${IMAGE_SIZE_SUFFIX}`;
  }

  // Transform API response to our NbaTeam format
  private transformTeam(apiTeam: TheSportsDbApiResponse["teams"][0]): NbaTeam {
    return {
      id: Number(apiTeam.idTeam),
      logo: this.withSizeSuffix(apiTeam.strBadge),
      name: apiTeam.strTeam,
      type: TournamentType.NBA,
    };
  }

  // Fetch all NBA teams from API
  private async fetchFromApi(): Promise<NbaTeam[]> {
    const response = (await httpRequest.load(
      THESPORTSDB_API_URL,
      httpRequest.CONSTANTS.RESPONSE_TYPES.JSON
    )) as TheSportsDbApiResponse;

    if (!(response.teams && Array.isArray(response.teams))) {
      throw new Error("[TheSportsDbService] Invalid API response structure");
    }

    return response.teams.map((team) => this.transformTeam(team));
  }

  // Get all NBA teams (from cache or API)
  async getAllNbaTeams(): Promise<NbaTeam[]> {
    await this.cacheLoaded;

    // Return fresh cache if available
    if (this.cache && this.isCacheFresh()) {
      return this.cache.teams;
    }

    // Fetch from API and update cache
    try {
      const teams = await this.fetchFromApi();
      this.saveCache(teams);
      return teams;
    } catch (error) {
      // If API fails but we have stale cache, use it as fallback
      if (this.cache) {
        console.warn(
          "[TheSportsDbService] API failed, using stale cache:",
          error
        );
        return this.cache.teams;
      }

      // Wrap error with service context for better debugging and classification
      const errorMessage =
        error instanceof Error ? error.message : "Service unavailable";
      const wrappedError = new Error(`[TheSportsDB] ${errorMessage}`);
      throw wrappedError;
    }
  }

  // Search teams by name (case-insensitive partial match)
  async searchTeams(search: string): Promise<NbaTeam[]> {
    const teams = await this.getAllNbaTeams();
    const searchLower = search.toLowerCase();

    return teams.filter((team) =>
      team.name.toLowerCase().includes(searchLower)
    );
  }

  // Get a single team by ID
  async getTeamById(id: number): Promise<NbaTeam | undefined> {
    const teams = await this.getAllNbaTeams();
    return teams.find((team) => team.id === id);
  }

  // Force refresh cache (useful for manual refresh)
  async forceRefresh(): Promise<NbaTeam[]> {
    const teams = await this.fetchFromApi();
    this.saveCache(teams);
    return teams;
  }
}

// Export singleton instance
export const theSportsDbService = new TheSportsDbService();
export default theSportsDbService;
