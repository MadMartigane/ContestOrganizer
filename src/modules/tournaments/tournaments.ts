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
  private readonly callbackCollector: ((num?: number) => void)[];
  private readonly httpRequest: HttpRequest;

  private tournaments: Tournament[];

  isBusy: Promise<unknown> | null;

  get length() {
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

  private parseLocalTournaments(tournamentsString: string | null): {
    timestamp: number;
    tournaments: Tournament[];
  } | null {
    if (!tournamentsString) {
      return null;
    }

    try {
      return JSON.parse(tournamentsString);
    } catch (e) {
      console.warn(
        "[Tournaments] Unable to parse stored tournaments. Cleanning of cache. ",
        e
      );
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    }
  }

  private instantiateTournaments(tournaments: Tournament[]): void {
    for (const t of tournaments) {
      for (let i = 0, imax = t.grid.length; i < imax; i++) {
        const teamRow = new TeamRow({ id: t.grid[i].id, type: t.grid[i].type });
        teamRow.fromData(t.grid[i]);
        t.grid[i] = teamRow;
      }

      if (!t.matchs) {
        t.matchs = [];
      }
    }
  }

  private async restore(): Promise<number> {
    const tournamentsString = this.getTournamentsCache();
    const localTournaments = this.parseLocalTournaments(tournamentsString);

    let backendTournaments: ProcedureContentStoredTournaments | null = null;

    try {
      backendTournaments = await this.getBackendTournaments();
    } catch (e) {
      console.warn(
        "[Tournaments] Unable to fetch the tournaments from the backend.",
        e
      );
    }

    const mergedTournaments = this.getMergedTournaments(
      localTournaments,
      backendTournaments
    );

    this.instantiateTournaments(mergedTournaments);
    this.tournaments = mergedTournaments;
    return await this.store();
  }

  private getMergedTournaments(
    localTournaments: { timestamp: number; tournaments: Tournament[] } | null,
    backendTournaments: ProcedureContentStoredTournaments | null
  ): Tournament[] {
    if (backendTournaments && !localTournaments) {
      return backendTournaments.tournaments;
    }

    if (backendTournaments && localTournaments) {
      const localTimestamp = localTournaments?.timestamp || 0;
      const backendTimestamp = backendTournaments?.timestamp || 0;

      if (localTimestamp >= backendTimestamp) {
        return this.mergeTournaments(
          localTournaments?.tournaments || [],
          backendTournaments?.tournaments
        );
      }

      return this.mergeTournaments(
        backendTournaments.tournaments,
        localTournaments?.tournaments || []
      );
    }

    return localTournaments?.tournaments || [];
  }

  private mergeTournaments(
    primaries: Tournament[],
    secondaries: Tournament[]
  ): Tournament[] {
    if (!primaries?.length) {
      return secondaries?.length ? secondaries : [];
    }

    const merged: Tournament[] = [];

    for (const primary of primaries) {
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
        continue;
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
    }

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
    for (const currentTournament of this.tournaments) {
      if (!currentTournament.timestamp) {
        currentTournament.timestamp = 0;
      }

      lastTimeStamp =
        currentTournament.timestamp > lastTimeStamp
          ? currentTournament.timestamp
          : lastTimeStamp;
    }

    return lastTimeStamp;
  }

  private store(realLastTimeStamp?: number): Promise<number> {
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

    return Promise.resolve(this.tournaments.length);
  }

  private throwOnUpdate() {
    for (const callback of this.callbackCollector) {
      setTimeout(() => {
        callback();
      });
    }
  }

  private resetScores(tournament: Tournament) {
    for (const team of tournament.grid) {
      team.concededGoals = 0;
      team.scoredGoals = 0;
      team.goalAverage = 0;
      team.points = 0;
    }
  }

  private updateTeamScore(
    team: TeamRow,
    scoredGoals: number,
    concededGoals: number,
    isDraw: boolean,
    isWinner: boolean
  ): void {
    if (isDraw) {
      team.points += 1;
    }
    if (isWinner) {
      team.points += 3;
    }

    team.scoredGoals += scoredGoals;
    team.concededGoals += concededGoals;
    team.goalAverage = team.scoredGoals - team.concededGoals;
  }

  private async updateScores(tournament: Tournament): Promise<void> {
    if (!tournament.matchs || tournament.matchs.length === 0) {
      return;
    }

    this.resetScores(tournament);

    for (const match of tournament.matchs) {
      if (match.status !== MatchStatus.DONE) {
        continue;
      }

      const vScore = match.goals.visitor || 0;
      const hScore = match.goals.host || 0;
      const host = await this.getTournamentTeam(tournament, match.hostId);
      const visitor = await this.getTournamentTeam(tournament, match.visitorId);

      if (host) {
        this.updateTeamScore(
          host,
          hScore,
          vScore,
          vScore === hScore,
          hScore > vScore
        );
      }

      if (visitor) {
        this.updateTeamScore(
          visitor,
          vScore,
          hScore,
          vScore === hScore,
          vScore > hScore
        );
      }
    }
  }

  getTournamentTeam(
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

  remove(id: number): Promise<number> {
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

  add(arg: {
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

  get(id: number | null): Promise<Tournament | null> {
    if (!id) {
      return Promise.resolve(null);
    }

    const promise = this.isBusy || Promise.resolve();

    return promise.then(
      () => this.tournaments.find((t) => t.id === id) || null
    );
  }

  async update(tournament: Tournament): Promise<number> {
    await (this.isBusy || Promise.resolve());

    const i = this.tournaments.findIndex((t) => t.id === tournament.id);

    if (i === -1) {
      console.warn(
        "[Tournaments] Unable to update the tourmament #%s.",
        tournament.id
      );
      return Promise.resolve(this.tournaments.length);
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

  map(
    callback: (value: Tournament, index: number, array: Tournament[]) => unknown
  ): unknown[] {
    return this.tournaments.map(
      (value: Tournament, index: number, array: Tournament[]) =>
        callback(value, index, array)
    );
  }

  onUpdate(callback: (num?: number) => void) {
    this.callbackCollector.push(callback);
  }

  getTournamentTypeLabel(type: TournamentType): string {
    let label = "";

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

  static sortGrid(grid: TeamRow[]): TeamRow[] {
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
