/*
 * https://dashboard.api-football.com/
 */

import httpRequest from "../http-request/http-request";
import type { GenericTeam } from "../team-row/team-row.d";
import { TournamentType } from "../tournaments/tournaments.types";
import { LOCAL_STORAGE_TEAM_KEY, SECRETS, URLS } from "./api-sports.constants";
import type {
  ApiSportsCache,
  ApiSportsSearchCache,
  ApiSportsTeamReturn,
} from "./api-sports.d";

export class ApiSports {
  private allTeams: GenericTeam[];
  private allSearch: ApiSportsSearchCache[];

  constructor() {
    this.loadCache().then((cache) => {
      this.allTeams = cache?.allTeams || [];
      this.allSearch = cache?.allSearch || [];
    });
  }

  private async loadCache(): Promise<ApiSportsCache | null> {
    const cacheString = localStorage.getItem(LOCAL_STORAGE_TEAM_KEY);
    let cache = null;

    if (cacheString) {
      try {
        cache = JSON.parse(cacheString);
      } catch (e) {
        console.warn(
          "[ApiSports] unable to parse stored teams. Clear cache:",
          e
        );
        localStorage.removeItem(LOCAL_STORAGE_TEAM_KEY);
        return null;
      }
    }

    return cache;
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
    let url;

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

  public async searchTeam(
    type: TournamentType,
    search: string
  ): Promise<GenericTeam[]> {
    if (search.length < 3) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([]);
        });
      });
    }

    const cache = this.allSearch.find(
      (candidate) => candidate.search === search && candidate.type === type
    );
    if (cache) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            cache.results.map((teamId) =>
              this.allTeams.find((t) => t.id === teamId && t.type === type)
            ) as GenericTeam[]
          );
        });
      });
    }

    const url = `${this.getSearchBaseUrl(type)}teams?search=${search}`;
    return httpRequest
      .load(url, httpRequest.CONSTANTS.RESPONSE_TYPES.JSON, [
        { name: "x-apisports-key", value: SECRETS },
      ])
      .then((rawData) => {
        const data = rawData as ApiSportsTeamReturn;

        this.allSearch.push({
          search,
          type,
          results: data.response.map((r) => r.id),
        });

        data.response.forEach((team) => {
          team.type = type;
        });
        this.allTeams = this.allTeams.concat(data.response);
        this.saveCache();

        return data.response;
      });
  }
}

const apiSports = new ApiSports();
export default apiSports;
