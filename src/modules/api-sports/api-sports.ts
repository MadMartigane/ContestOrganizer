/*
 * https://dashboard.api-football.com/
 */

import httpRequest from "../http-request/http-request";
import type { GenericTeam } from "../team-row/team-row.d";
import { TournamentType } from "../tournaments/tournaments.types";
import {
  API_SPORTS_KEY,
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
    this.cacheLoaded = this.loadCache().then((cache) => {
      this.allTeams = cache?.allTeams || [];
      this.allSearch = cache?.allSearch || [];
    });
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
        return Promise.resolve(
          cache.results.map((teamId) =>
            this.allTeams.find((t) => t.id === teamId && t.type === type)
          ) as GenericTeam[]
        );
      }

      const url = `${this.getSearchBaseUrl(type)}teams?search=${search}`;
      return httpRequest
        .load(url, httpRequest.CONSTANTS.RESPONSE_TYPES.JSON, [
          { name: "x-apisports-key", value: API_SPORTS_KEY },
        ])
        .then((rawData) => {
          const data = rawData as ApiSportsTeamReturn;

          if (data.response && data.response.length > 0) {
            this.allSearch.push({
              search,
              type,
              results: data.response.map((r) => r.team.id),
            });

            const teams = data.response.map((r) => ({
              ...r.team,
              type,
            }));
            this.allTeams = this.allTeams.concat(teams);
            this.saveCache();
          }

          return data.response.map((r) => r.team);
        })
        .catch((error) => {
          console.error("[ApiSports] API request failed:", error);
          throw error;
        });
    });
  }
}

const apiSports = new ApiSports();
export default apiSports;
