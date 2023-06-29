
import { MatchStatus, Tournament, TournamentType, TournamentTypeLabel } from "./tournaments.d";
import { CACHE_KEY } from "./tournaments.constants";
import uuid from "../uuid/uuid";
import TeamRow from "../team-row/team-row";

export class Match {
  public readonly id: number;
  public hostId: number | null;
  public visitorId: number | null;
  public goals: { visitor: number, host: number };
  public status: MatchStatus;

  constructor(host = null, visitor = null, status = null) {
    this.id = uuid.new();
    this.hostId = host;
    this.visitorId = visitor;
    this.goals = { host: 0, visitor: 0 };
    this.status = status || MatchStatus.PENDING;
  }
}

class Tournaments {

  private readonly CACHE_KEY: typeof CACHE_KEY;
  private readonly uuid: typeof uuid;
  private readonly callbackCollector: Array<Function>;

  private tournaments: Array<Tournament>;

  public get length () {
    return this.tournaments.length;
  }

  constructor () {
    this.CACHE_KEY = CACHE_KEY;
    this.uuid = uuid;
    this.callbackCollector = [];

    this.tournaments = [];

    this.restore();
  }

  private restore (): void {
    const tournamentsString = localStorage.getItem(this.CACHE_KEY);

    if (tournamentsString) {
      try {
        this.tournaments = JSON.parse(tournamentsString);
      } catch (e) {
        console.warn("[Tournaments] Unable to parse stored tourmaments. Cleanning of cache. ", e);
        localStorage.removeItem(this.CACHE_KEY);
      }
    }

    /* From stored data to instanciated object */
    this.tournaments.forEach((t) => {
      for (let i = 0, imax = t.grid.length; i < imax; i++) {
        const teamRow = new TeamRow({ id: t.grid[i].id, type: t.grid[i].type });
        teamRow.fromData(t.grid[i]);
        t.grid[i] = teamRow;
      }

      if (!t.matchs) { t.matchs = [] }
    });
  }

  private store () {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.tournaments));
    this.throwOnUpdate();
    return this.tournaments.length;
  }

  private throwOnUpdate () {
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

  private updateScores(tournament: Tournament) {
    if (!tournament.matchs || tournament.matchs.length === 0) { return; }

    this.resetScores(tournament);

    tournament.matchs.forEach((match) => {
      if (match.status !== MatchStatus.DONE) { return; }

      const vScore = match.goals.visitor || 0;
      const hScore = match.goals.host || 0;
      const host = this.getTournamentTeam(tournament, match.hostId);
      const visitor = this.getTournamentTeam(tournament, match.visitorId);

      if (host) {
        if (vScore === hScore) { host.points += 1; }
        if (hScore > vScore) { host.points += 3; }

        host.scoredGoals += hScore;
        host.concededGoals += vScore;
        host.goalAverage = host.scoredGoals - host.concededGoals;
      }

      if (visitor) {
        if (vScore === hScore) { visitor.points += 1; }
        if (vScore > hScore) { visitor.points += 3; }

        visitor.scoredGoals += vScore;
        visitor.concededGoals += hScore;
        visitor.goalAverage = visitor.scoredGoals - visitor.concededGoals;
      }
    })
  }

  public getTournamentTeam(tournament: Tournament, teamId: number | null): TeamRow | null {
    if (!teamId) { return null; }

    return tournament.grid.find((team) => team.id === teamId) || null;
  }

  public remove(id: number): number {
    this.tournaments = this.tournaments.filter((t) => t.id !== id);
    return this.store();
  }

  public add(arg: {
    name: string,
    grid: Array<TeamRow>,
    matchs: Match[],
    type: TournamentType
  }): number {

    const { name, grid, matchs, type } = arg;

    this.tournaments.push({
      id: this.uuid.new(),
      name,
      grid,
      matchs,
      type
    });

    return this.store();
  }

  public get(id: number | null): Tournament | null {
    if (!id) { return null; }

    return this.tournaments.find((t) => t.id === id) || null;
  }

  public update (tournament: Tournament): number {
    const i = this.tournaments.findIndex((t) => t.id === tournament.id);

    if (i === -1) {
      console.warn("[Tournaments] Unable to update the tourmament #%s.", tournament.id);
      return this.tournaments.length;
    }

    this.updateScores(tournament);
    this.tournaments[i] = tournament;
    return this.store();
  }

  public map (callback: Function): Array<any> {
    return this.tournaments.map((value: Tournament, index: number, array: Tournament[]) => callback(value, index, array));
  }

  public onUpdate (callback: Function) {
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
}

const tournaments = new Tournaments();
export default tournaments;
