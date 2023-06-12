/*
 * https://dashboard.api-football.com/
 */

import httpRequest from "../http-request/http-request";
import { ApiSportsTeamReturn, ApiSportsTeam, ApiSportsCache, ApiSportsSearchCache } from "./api-sports.d";
import { SECRETS, LOCAL_STORAGE_TEAM_KEY } from "./api-sports.constants";

export class ApiSports {

  private allTeams: ApiSportsTeam[];
  private allSearch: ApiSportsSearchCache[];

  constructor () {

    this.loadCache().then((cache) => {
      this.allTeams = cache && cache.allTeams || [];
      this.allSearch = cache && cache.allSearch || [];
    });
  }

  private async loadCache(): Promise<ApiSportsCache | null> {
    const cacheString = localStorage.getItem(LOCAL_STORAGE_TEAM_KEY);
    let cache = null;

    if (cacheString) {
      try {
        cache = JSON.parse(cacheString);
      } catch (e) {
        console.warn("[ApiApiSports] unable to parse stored teams. Clear cache:", e);
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
        allTeams: this.allTeams
      })
    );
  }

  public async searchTeam(search: string): Promise<ApiSportsTeam[]> {
    if (search.length < 3) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([]);
        });
      })
    }

    const cache = this.allSearch.find((candidate) => candidate.search === search);
    if (cache) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            cache.results.map((teamId) => this.allTeams.find((t) => t.id === teamId)) as ApiSportsTeam[]
          );
        });
      });
    }

    const url = `https://v1.basketball.api-sports.io/teams?search=${search}`;
    return httpRequest.load(
      url,
      httpRequest.CONSTANTS.RESPONSE_TYPES.JSON,
      [{ name: "x-apisports-key", value: SECRETS }]
    )
      .then((rawData) => {
        console.log("[api-sports][searchTean()] rawData: ", rawData);
        const data = rawData as ApiSportsTeamReturn;
        
        this.allSearch.push({
          search,
          results: data.response.map((r) => r.id)
        });
        this.allTeams = this.allTeams.concat(data.response);
        this.saveCache();
        console.log("[api-sports][searchTean()] this.allSearch: ", this.allSearch);
        console.log("[api-sports][searchTean()] this.allTeams: ", this.allTeams);

        return data.response;
      });
  }

}


const apiSports = new ApiSports();
export default apiSports;

