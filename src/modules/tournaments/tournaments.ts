import { HttpRequest } from "../http-request/http-request";
import type { Match } from "../matchs/matchs";
import { MatchStatus } from "../matchs/matchs";
import { Procedure } from "../procedure/procedure";
import type {
  ProcedureContentStoredTournaments,
  ProcedureData,
} from "../procedure/procedure.types";
import TeamRow from "../team-row/team-row";
import uuid from "../uuid/uuid";
import { CACHE_KEY } from "./tournaments.constants";
import {
  type Tournament,
  TournamentType,
  TournamentTypeLabel,
} from "./tournaments.types";

export class Tournaments {
  private readonly CACHE_KEY: string;
  private readonly uuid: typeof uuid;
  private readonly callbackCollector: Function[];
  private readonly httpRequest: HttpRequest;

  private tournaments: Tournament[];

  public isBusy: Promise<unknown> | null;

  public get length() {
    return this.tournaments.length;
  }

  constructor() {
    this.uuid = uuid;
    this.callbackCollector = [];
    this.httpRequest = new HttpRequest();

    this.tournaments = [];

    this.CACHE_KEY = this.buildCacheKey();

    this.isBusy = this.restore().finally(() => {
      this.isBusy = null;
    });
  }

  private buildCacheKey(): string {
    const pathName = window.location.pathname.replace(/\//g, "_");
    return `${pathName}_${CACHE_KEY}`;
  }

  private getTournamentsCache(tryOldCach = false): string | null {
    const tournamentsString = localStorage.getItem(
      tryOldCach ? CACHE_KEY : this.CACHE_KEY
    );

    if (tournamentsString) {
      localStorage.setItem(CACHE_KEY, tournamentsString);
      return tournamentsString;
    }

    if (!tryOldCach) {
      return this.getTournamentsCache(true);
    }

    return null;
  }

  private async restore(): Promise<number> {
    const tournamentsString = this.getTournamentsCache();
    let localTournaments: {
      timestamp: number;
      tournaments: Tournament[];
    } | null = null;

    if (tournamentsString) {
      try {
        localTournaments = JSON.parse(tournamentsString);
      } catch (e) {
        console.warn(
          "[Tournaments] Unable to parse stored tournaments. Cleanning of cache. ",
          e
        );
        localStorage.removeItem(this.CACHE_KEY);
      }
    }

    let backendTournaments: ProcedureContentStoredTournaments | null = null;

    try {
      backendTournaments = await this.getBackendTournaments();
    } catch (e) {
      console.warn(
        "[Tournaments] Unable to fetch the tournaments from the backend.",
        e
      );
    }

    let mergedTournaments: Tournament[];

    if (backendTournaments && !localTournaments) {
      mergedTournaments = backendTournaments.tournaments;
    } else if (backendTournaments && localTournaments) {
      let recentTournaments: Tournament[];
      let oldestTournaments: Tournament[];

      if (
        (localTournaments?.timestamp || 0) >=
        (backendTournaments?.timestamp || 0)
      ) {
        recentTournaments = localTournaments?.tournaments || [];
        oldestTournaments = backendTournaments?.tournaments;
      } else {
        recentTournaments = backendTournaments.tournaments;
        oldestTournaments = localTournaments?.tournaments || [];
      }

      mergedTournaments = this.mergeTournaments(
        recentTournaments,
        oldestTournaments
      );
    } else {
      mergedTournaments = localTournaments?.tournaments || [];
    }

    /* From stored data to instanciated object */
    mergedTournaments.forEach((t) => {
      for (let i = 0, imax = t.grid.length; i < imax; i++) {
        const teamRow = new TeamRow({ id: t.grid[i].id, type: t.grid[i].type });
        teamRow.fromData(t.grid[i]);
        t.grid[i] = teamRow;
      }

      if (!t.matchs) {
        t.matchs = [];
      }
    });

    this.tournaments = mergedTournaments;
    return await this.store();
  }

  private mergeTournaments(
    primaries: Tournament[],
    secondaries: Tournament[]
  ): Tournament[] {
    if (!primaries?.length) {
      return secondaries?.length ? secondaries : [];
    }

    const merged: Tournament[] = [];

    primaries.forEach((primary) => {
      const secondary = secondaries.find(
        (candidate) => candidate.id === primary.id
      );
      if (!secondary) {
        // That mean the tournament doesn't exist in the oldest record. We have to keep it.
        console.groupEnd();
        if (!primary.timestamp) {
          primary.timestamp = Date.now();
        }

        merged.push(primary);
        return;
      }

      if ((primary?.timestamp || 0) >= (secondary?.timestamp || 0)) {
        if (!primary.timestamp) {
          primary.timestamp = Date.now();
        }

        merged.push(primary);
      } else {
        if (!secondary.timestamp) {
          secondary.timestamp = Date.now();
        }

        merged.push(secondary);
      }
    });

    return merged;
  }

  private async getBackendTournaments(): Promise<ProcedureContentStoredTournaments | null> {
    const backendData = (await this.httpRequest.load(
      "/api/index.php/list/tournaments"
    )) as ProcedureData;

    const procedure = new Procedure(backendData);
    if (procedure.isError()) {
      throw new Error(procedure.toString());
    }

    const procedureContent =
      procedure.getData() as ProcedureContentStoredTournaments;
    if (
      procedureContent?.timestamp &&
      Array.isArray(procedureContent.tournaments)
    ) {
      return procedureContent;
    }

    return null;
  }

  private async storeBackendTournaments(
    content: ProcedureContentStoredTournaments
  ): Promise<void> {
    const procedureData = (await this.httpRequest.post(
      "/api/index.php/store/tournaments",
      JSON.stringify(content)
    )) as ProcedureData;

    const procedure = new Procedure(procedureData);
    if (procedure.isError()) {
      throw new Error(procedure.toString());
    }
  }

  private getLastTimeStampInTournaments(): number {
    let lastTimeStamp = 0;
    this.tournaments.forEach((currentTournament: Tournament) => {
      if (!currentTournament.timestamp) {
        currentTournament.timestamp = 0;
      }

      lastTimeStamp =
        currentTournament.timestamp > lastTimeStamp
          ? currentTournament.timestamp
          : lastTimeStamp;
    });

    return lastTimeStamp;
  }

  private async store(realLastTimeStamp?: number): Promise<number> {
    const lastTimeStamp =
      realLastTimeStamp || this.getLastTimeStampInTournaments();
    const content = { timestamp: lastTimeStamp, tournaments: this.tournaments };

    localStorage.setItem(this.CACHE_KEY, JSON.stringify(content));

    try {
      this.storeBackendTournaments(content);
    } catch (e) {
      // TODO: send global error event.
      console.error(
        "[Tournaments] Unable to save the tournaments on the backend: ",
        e
      );
    }

    this.throwOnUpdate();

    return this.tournaments.length;
  }

  private throwOnUpdate() {
    this.callbackCollector.forEach((callback) => {
      setTimeout(() => {
        callback();
      });
    });
  }

  private resetScores(tournament: Tournament) {
    tournament.grid.forEach((team) => {
      team.concededGoals = 0;
      team.scoredGoals = 0;
      team.goalAverage = 0;
      team.points = 0;
    });
  }

  private async updateScores(tournament: Tournament): Promise<void> {
    if (!tournament.matchs || tournament.matchs.length === 0) {
      return;
    }

    this.resetScores(tournament);

    tournament.matchs.forEach(async (match) => {
      if (match.status !== MatchStatus.DONE) {
        return;
      }

      const vScore = match.goals.visitor || 0;
      const hScore = match.goals.host || 0;
      const host = await this.getTournamentTeam(tournament, match.hostId);
      const visitor = await this.getTournamentTeam(tournament, match.visitorId);

      if (host) {
        if (vScore === hScore) {
          host.points += 1;
        }
        if (hScore > vScore) {
          host.points += 3;
        }

        host.scoredGoals += hScore;
        host.concededGoals += vScore;
        host.goalAverage = host.scoredGoals - host.concededGoals;
      }

      if (visitor) {
        if (vScore === hScore) {
          visitor.points += 1;
        }
        if (vScore > hScore) {
          visitor.points += 3;
        }

        visitor.scoredGoals += vScore;
        visitor.concededGoals += hScore;
        visitor.goalAverage = visitor.scoredGoals - visitor.concededGoals;
      }
    });
  }

  public async getTournamentTeam(
    tournament: Tournament,
    teamId: number | null
  ): Promise<TeamRow | null> {
    if (!teamId) {
      return Promise.resolve(null);
    }

    const promise = this.isBusy || Promise.resolve();

    return promise.then(
      () => tournament.grid.find((team) => team.id === teamId) || null
    );
  }

  public async remove(id: number): Promise<number> {
    if (!id) {
      return Promise.reject(
        new Error("[Tournaments.remove()] Missing tournament id.")
      );
    }

    const promise = this.isBusy || Promise.resolve();
    return promise.then(() => {
      this.tournaments = this.tournaments.filter((t) => t.id !== id);
      return this.store(Date.now());
    });
  }

  public async add(arg: {
    name: string;
    grid: TeamRow[];
    matchs: Match[];
    type: TournamentType;
  }): Promise<number> {
    const { name, grid, matchs, type } = arg;
    const promise = this.isBusy || Promise.resolve();

    return promise.then(() => {
      this.tournaments.push({
        id: this.uuid.new(),
        name,
        grid,
        matchs,
        type,
        timestamp: Date.now(),
      });

      return this.store();
    });
  }

  public async get(id: number | null): Promise<Tournament | null> {
    if (!id) {
      return Promise.resolve(null);
    }

    const promise = this.isBusy || Promise.resolve();

    return promise.then(
      () => this.tournaments.find((t) => t.id === id) || null
    );
  }

  public async update(tournament: Tournament): Promise<number> {
    await (this.isBusy || Promise.resolve());

    const i = this.tournaments.findIndex((t) => t.id === tournament.id);

    if (i === -1) {
      console.warn(
        "[Tournaments] Unable to update the tourmament #%s.",
        tournament.id
      );
      return this.tournaments.length;
    }

    if (
      tournament.type !== TournamentType.NBA &&
      tournament.type !== TournamentType.BASKET
    ) {
      await this.updateScores(tournament);
    } else {
      this.resetScores(tournament);
    }

    tournament.timestamp = Date.now();
    this.tournaments[i] = tournament;
    return this.store();
  }

  public map(callback: Function): any[] {
    return this.tournaments.map(
      (value: Tournament, index: number, array: Tournament[]) =>
        callback(value, index, array)
    );
  }

  public onUpdate(callback: Function) {
    this.callbackCollector.push(callback);
  }

  public getTournamentTypeLabel(type: TournamentType): string {
    let label;

    switch (type) {
      case TournamentType.NBA:
        label = TournamentTypeLabel.NBA;
        break;
      case TournamentType.BASKET:
        label = TournamentTypeLabel.BASKET;
        break;
      case TournamentType.NFL:
        label = TournamentTypeLabel.NFL;
        break;
      case TournamentType.RUGBY:
        label = TournamentTypeLabel.RUGBY;
        break;
      default:
        label = TournamentTypeLabel.FOOT;
        break;
    }

    return label;
  }

  public static sortGrid(grid: TeamRow[]): TeamRow[] {
    return [...grid].sort((a, b) => {
      if (a.points !== b.points) {
        return b.points - a.points;
      }
      return b.goalAverage - a.goalAverage;
    });
  }
}

const tournaments = new Tournaments();
export default tournaments;
