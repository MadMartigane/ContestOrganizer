/*
 * https://futdb.app/api/doc
 */

import httpRequest from "../httpRequest/http-request";
import { FutDBLoadedImgBuffer, FutDBTeamReturn, FutDBTeam, FutDBPagination } from "./futdb.d";
import { SECRETS, LOCAL_STORAGE_TEAM_KEY } from "./futdb.constants";

export class ApiFutDB {

  private readonly loadedImg: Array<FutDBLoadedImgBuffer>;

  private isLoading: Promise<Array<FutDBTeam>> | null;
  private allTeams: Array<FutDBTeam>;
  private pagination: FutDBPagination;
  private countReturn: number;


  constructor () {
    this.isLoading = null;
    this.allTeams = [];
    this.loadedImg = [];
    this.pagination = {
      countCurrent: 0,
      countTotal: 0,
      pageCurrent: 0,
      pageTotal: 30, // Fake start condition
      itemsPerPage: 0
    };
    this.countReturn = 0;

    this.loadCache().then((cache) => {
      this.allTeams = cache || [];
    });
  }

  private async loadCache(): Promise<Array<FutDBTeam> | null> {
    const cacheString = localStorage.getItem(LOCAL_STORAGE_TEAM_KEY);
    let cache: Array<FutDBTeam>;

    if (cacheString) {
      try {
        cache = JSON.parse(cacheString);
      } catch (e) {
        console.warn("[ApiFutDB] unable to parse stored teams. Clear cache:", e);
        localStorage.removeItem(LOCAL_STORAGE_TEAM_KEY);
        return null;
      }
    }

    return cache;
  }

  private async loadTeamsPage(pageNumber: number, resolve: Function, reject: Function): Promise<FutDBPagination> {
    const url = `https://futdb.app/api/clubs?page=${pageNumber}`;
    return httpRequest.load(
      url,
      httpRequest.CONSTANTS.RESPONSE_TYPES.JSON,
      [ { name: "X-AUTH-TOKEN", value: SECRETS } ]
    )
    .then((rawData) => {
      const data = rawData as FutDBTeamReturn;
      if (data?.items.length) {
        this.allTeams = this.allTeams.concat((data.items));
        this.pagination.countCurrent = this.allTeams.length;
      }

      this.countReturn++;
      if (pageNumber > 1 && this.pagination.pageCurrent < this.pagination.pageTotal) {
        this.pagination.pageCurrent++;
        this.loadTeamsPage(this.pagination.pageCurrent, resolve, reject)
      }

      if (this.countReturn >= this.pagination.pageTotal) {
        resolve(this.allTeams);

        localStorage.setItem(
          LOCAL_STORAGE_TEAM_KEY,
          JSON.stringify(this.allTeams)
        );

        this.isLoading = null;
      }

      return data.pagination;
    });
  }

  public async loadTeams (): Promise<Array<FutDBTeam>> {

    if (this.isLoading) {
      return this.isLoading;
    }

    if (this.allTeams.length) {
      return new Promise((resolve) => {
        resolve(this.allTeams);
      });
    }

    this.isLoading = new Promise((resolve, reject) => {
      this.loadTeamsPage(1, resolve, reject)
      .then((pagination) => {

        this.pagination = pagination;

        for( let i = 0; i < 3; i++ ) {
          this.pagination.pageCurrent++;
          this.loadTeamsPage(this.pagination.pageCurrent, resolve, reject)
        }

      })
      .catch((error) => {
        reject(error);
      });
    });

    return this.isLoading;
  }

  public async loadTeamImage(id: number): Promise<string> {
    const buffer = this.loadedImg.find((buff) => buff.id === id);
    if (buffer) {
      return new Promise((resolve) => {
        resolve(buffer.src);
      });
    }

    const url = `https://futdb.app/api/clubs/${id}/image`;
    return httpRequest.load(
      url,
      httpRequest.CONSTANTS.RESPONSE_TYPES.BLOB,
      [ { name: "X-AUTH-TOKEN", value: SECRETS } ]
    )
    .then((rawData) => {
      const data = rawData as Blob;
      /* Use one file reader for each img */
      const fileReader = new FileReader();
      const handler = (resolve: Function) => {

        fileReader.addEventListener("load", () => {
          const src = fileReader.result as string;
          this.loadedImg.push({ id, src })
          resolve(src);
        });

        fileReader.readAsDataURL(data);
      };

      return new Promise(handler);
    });
  }
}


const apiFutDB = new ApiFutDB();
export default apiFutDB;

