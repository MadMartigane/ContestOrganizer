/*
 * https://dashboard.api-football.com/
 */

import httpRequest from "../http-request/http-request";
import type { GenericTeam } from "../team-row/team-row.d";
import { TournamentType } from "../tournaments/tournaments.types";
import {
  API_SPORTS_KEY,
  LEGACY_CACHE_KEYS,
  LOCAL_STORAGE_TEAM_KEY,
  URLS,
} from "./api-sports.constants";
import type {
  ApiSportsCache,
  ApiSportsSearchCache,
  ApiSportsTeamReturn,
} from "./api-sports.d";

export class ApiSports {
  private allTeams: GenericTeam[];
  private allSearch: ApiSportsSearchCache[];
  private readonly cacheLoaded: Promise<void>;

  constructor() {
    this.allTeams = [];
    this.allSearch = [];
    this.cleanupLegacyCache();
    this.cacheLoaded = this.loadCache().then((cache) => {
      this.allTeams = cache?.allTeams || [];
      this.allSearch = cache?.allSearch || [];
    });
  }

  // TODO: Remove this legacy cache cleanup after a few weeks
  private cleanupLegacyCache(): void {
    for (const key of LEGACY_CACHE_KEYS) {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
      }
    }
  }

  private loadCache(): Promise<ApiSportsCache | null> {
    const cacheString = localStorage.getItem(LOCAL_STORAGE_TEAM_KEY);
    let cache: ApiSportsCache | null = null;

    if (cacheString) {
      try {
        cache = JSON.parse(cacheString);
      } catch (e) {
        console.warn(
          "[ApiSports] unable to parse stored teams. Clear cache:",
          e
        );
        localStorage.removeItem(LOCAL_STORAGE_TEAM_KEY);
        return Promise.resolve(null);
      }
    }

    return Promise.resolve(cache);
  }

  private saveCache(): void {
    localStorage.setItem(
      LOCAL_STORAGE_TEAM_KEY,
      JSON.stringify({
        allSearch: this.allSearch,
        allTeams: this.allTeams,
      })
    );
  }

  private getSearchBaseUrl(type: TournamentType) {
    let url: string;

    switch (type) {
      case TournamentType.BASKET:
        url = URLS.BASKET;
        break;
      case TournamentType.NBA:
        url = URLS.NBA;
        break;
      case TournamentType.NFL:
        url = URLS.NFL;
        break;
      case TournamentType.RUGBY:
        url = URLS.RUGBY;
        break;
      default:
        url = URLS.FOOT;
        break;
    }

    return url;
  }

  searchTeam(type: TournamentType, search: string): Promise<GenericTeam[]> {
    if (search.length < 3) {
      return Promise.resolve([]);
    }

    return this.cacheLoaded.then(() => {
      const cache = this.allSearch.find(
        (candidate) => candidate.search === search && candidate.type === type
      );
      if (cache && cache.results.length > 0) {
        const teams = cache.results
          .map((teamId) =>
            this.allTeams.find((t) => t.id === teamId && t.type === type)
          )
          .filter((team): team is GenericTeam => team !== undefined);

        if (teams.length > 0) {
          return Promise.resolve(teams);
        }
        // If no valid teams found, fall through to API call
      }

      const url = `${this.getSearchBaseUrl(type)}teams?search=${search}`;
      return httpRequest
        .load(url, httpRequest.CONSTANTS.RESPONSE_TYPES.JSON, [
          { name: "x-apisports-key", value: API_SPORTS_KEY },
        ])
        .then((rawData) => {
          const data = rawData as ApiSportsTeamReturn;

          if (data.response && data.response.length > 0) {
            // Handle both API response structures:
            // Structure 1: { team: { id, name, ... } } - used by FOOT, NBA, etc.
            // Structure 2: { id, name, ... } - team data directly, used by RUGBY
            const teams = data.response.map((r) => {
              const teamData = r.team || r;
              return {
                ...teamData,
                type,
              };
            });

            const teamIds = teams.map((t) => t.id);

            this.allSearch.push({
              search,
              type,
              results: teamIds,
            });

            this.allTeams = this.allTeams.concat(teams);
            this.saveCache();

            return teams;
          }
          return [];
        })
        .catch((error) => {
          console.error("[ApiSports] Error searching for team:", error);
          throw error;
        });
    });
  }
}

const apiSports = new ApiSports();
export default apiSports;
