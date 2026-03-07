/*
 * https://futdb.app/api/doc
 */

import httpRequest from "../http-request/http-request";
import type { GenericTeam } from "../team-row/team-row.d";
import { TournamentType } from "../tournaments/tournaments.types";
import { FUTDB_KEY, LOCAL_STORAGE_TEAM_KEY } from "./futdb.constants";
import type {
  FutDBLoadedImgBuffer,
  FutDBPagination,
  FutDBTeamReturn,
} from "./futdb.d";

const DB_NAME = "FutDBCache";
const DB_VERSION = 1;
const STORE_NAME = "teamImages";

interface HttpHeaderType {
  name: string;
  value: string;
}

export class ApiFutDB {
  private readonly loadedImg: FutDBLoadedImgBuffer[];

  private isLoading: Promise<GenericTeam[]> | null;
  private allTeams: GenericTeam[];
  private pagination: FutDBPagination;
  private countReturn: number;

  // Request queue for rate limiting
  private readonly requestQueue: Array<() => Promise<void>> = [];
  private activeRequests = 0;
  private readonly MAX_CONCURRENT = 3;

  // IndexedDB for persistent caching
  private db: IDBDatabase | null = null;

  constructor() {
    this.isLoading = null;
    this.allTeams = [];
    this.loadedImg = [];
    this.pagination = {
      countCurrent: 0,
      countTotal: 0,
      pageCurrent: 0,
      pageTotal: 30, // Fake start condition
      itemsPerPage: 0,
    };
    this.countReturn = 0;

    this.initDB()
      .then(() => {
        console.log("[ApiFutDB] IndexedDB initialized");
      })
      .catch((error) => {
        console.warn("[ApiFutDB] Failed to initialize IndexedDB:", error);
      });

    this.loadCache().then((cache) => {
      this.allTeams = cache || [];
    });
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
    });
  }

  private getCachedImage(id: number): Promise<string | null> {
    const db = this.db;
    if (!db) {
      return Promise.resolve(null);
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result?.src || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async cacheImage(id: number, src: string): Promise<void> {
    if (!this.db) {
      return;
    }
    const tx = this.db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await store.put({ id, src, timestamp: Date.now() });
  }

  private processQueue(): void {
    while (
      this.requestQueue.length > 0 &&
      this.activeRequests < this.MAX_CONCURRENT
    ) {
      this.activeRequests++;
      const request = this.requestQueue.shift();
      if (request) {
        request().finally(() => {
          this.activeRequests--;
          this.processQueue();
        });
      }
    }
  }

  private async fetchWithRetry(
    url: string,
    headers: HttpHeaderType[],
    maxRetries = 3
  ): Promise<Blob> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return (await httpRequest.load(
          url,
          httpRequest.CONSTANTS.RESPONSE_TYPES.BLOB,
          headers
        )) as Blob;
      } catch (error) {
        const is429 = error instanceof Error && error.message.includes("429");
        if (is429 && attempt < maxRetries - 1) {
          const delay = 2 ** attempt * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw new Error("Max retries exceeded");
  }

  private loadCache(): Promise<GenericTeam[] | null> {
    const cacheString = localStorage.getItem(LOCAL_STORAGE_TEAM_KEY);
    let cache = null as GenericTeam[] | null;

    if (cacheString) {
      try {
        cache = JSON.parse(cacheString);
      } catch (e) {
        console.warn(
          "[ApiFutDB] unable to parse stored teams. Clear cache:",
          e
        );
        localStorage.removeItem(LOCAL_STORAGE_TEAM_KEY);
        return Promise.resolve(null);
      }
    }

    return Promise.resolve(cache);
  }

  private loadTeamsPage(
    pageNumber: number,
    resolve: (value: GenericTeam[]) => void,
    reject: (reason?: unknown) => void
  ): Promise<FutDBPagination> {
    const url = `https://futdb.app/api/clubs?page=${pageNumber}`;
    return httpRequest
      .load(url, httpRequest.CONSTANTS.RESPONSE_TYPES.JSON, [
        { name: "X-AUTH-TOKEN", value: FUTDB_KEY },
      ])
      .then((rawData) => {
        const data = rawData as FutDBTeamReturn;
        if (data?.items.length) {
          for (const team of data.items) {
            team.type = TournamentType.FOOT;
          }
          this.allTeams = this.allTeams.concat(data.items);
          this.pagination.countCurrent = this.allTeams.length;
        }

        this.countReturn++;
        if (
          pageNumber > 1 &&
          this.pagination.pageCurrent < this.pagination.pageTotal
        ) {
          this.pagination.pageCurrent++;
          this.loadTeamsPage(this.pagination.pageCurrent, resolve, reject);
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

  loadTeams(): Promise<GenericTeam[]> {
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

          for (let i = 0; i < 3; i++) {
            this.pagination.pageCurrent++;
            this.loadTeamsPage(this.pagination.pageCurrent, resolve, reject);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });

    return this.isLoading;
  }

  loadTeamImage(id: number): Promise<string> {
    // Check memory cache first
    const buffer = this.loadedImg.find((buff) => buff.id === id);
    if (buffer) {
      return Promise.resolve(buffer.src);
    }

    // Check IndexedDB cache
    return this.getCachedImage(id).then((cachedSrc) => {
      if (cachedSrc) {
        this.loadedImg.push({ id, src: cachedSrc });
        return cachedSrc;
      }

      // Add to request queue
      return new Promise<string>((resolve) => {
        const request = async () => {
          const url = `https://futdb.app/api/clubs/${id}/image`;
          const headers: HttpHeaderType[] = [
            { name: "X-AUTH-TOKEN", value: FUTDB_KEY },
          ];

          try {
            const data = await this.fetchWithRetry(url, headers);
            /* Use one file reader for each img */
            const fileReader = new FileReader();
            fileReader.addEventListener("load", () => {
              const src = fileReader.result as string;
              this.loadedImg.push({ id, src });
              this.cacheImage(id, src);
              resolve(src);
            });
            fileReader.readAsDataURL(data);
          } catch (error) {
            console.error(
              `[ApiFutDB] Failed to load image for team ${id}:`,
              error
            );
            resolve("");
          }
        };

        this.requestQueue.push(request);
        this.processQueue();
      });
    });
  }
}

const apiFutDB = new ApiFutDB();
export default apiFutDB;
