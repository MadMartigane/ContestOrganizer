import { Tournament, TournamentType, TournamentTypeLabel } from './tournaments.types';
import { MatchStatus } from '../matchs/matchs.d';
import { Match } from '../matchs/matchs';
import { CACHE_KEY } from './tournaments.constants';
import uuid from '../uuid/uuid';
import TeamRow from '../team-row/team-row';
import { HttpRequest } from '../http-request/http-request';
import { ProcedureContentStoredTournaments, ProcedureData } from '../procedure/procedure.types';
import { Procedure } from '../procedure/procedure';

class Tournaments {
  private readonly CACHE_KEY: typeof CACHE_KEY;
  private readonly uuid: typeof uuid;
  private readonly callbackCollector: Array<Function>;
  private readonly httpRequest: HttpRequest;

  private tournaments: Array<Tournament>;
  private isBusy: Promise<unknown> | null;

  public get length() {
    return this.tournaments.length;
  }

  constructor() {
    this.CACHE_KEY = CACHE_KEY;
    this.uuid = uuid;
    this.callbackCollector = [];
    this.httpRequest = new HttpRequest();

    this.tournaments = [];

    this.isBusy = this.restore().finally(() => {
      this.isBusy = null;
    });
  }

  private async restore(): Promise<number> {
    const tournamentsString = localStorage.getItem(this.CACHE_KEY);
    let localTournaments: { timestamp: number; tournaments: Array<Tournament> } | null = null;

    if (tournamentsString) {
      try {
        localTournaments = JSON.parse(tournamentsString);
      } catch (e) {
        console.warn('[Tournaments] Unable to parse stored tournaments. Cleanning of cache. ', e);
        localStorage.removeItem(this.CACHE_KEY);
      }
    }

    let backendTournaments = null as ProcedureContentStoredTournaments | null;
    try {
      backendTournaments = await this.getBackendTournaments();
    } catch (e) {
      console.warn('[Tournaments] Unable to fetch the tournaments from the backend.', e);
    }

    let mergedTournaments: Array<Tournament>;
    if (backendTournaments && !localTournaments) {
      mergedTournaments = backendTournaments.tournaments;
    } else if (backendTournaments) {
      let recentTournaments: Array<Tournament>;
      let oldestTournaments: Array<Tournament>;
      if (localTournaments?.timestamp || 0 > backendTournaments?.timestamp) {
        recentTournaments = localTournaments?.tournaments || [];
        oldestTournaments = backendTournaments?.tournaments;
      } else {
        recentTournaments = backendTournaments.tournaments;
        oldestTournaments = localTournaments?.tournaments || [];
      }

      mergedTournaments = this.mergeTournaments(recentTournaments, oldestTournaments);
    } else {
      mergedTournaments = localTournaments?.tournaments || [];
    }

    /* From stored data to instanciated object */
    mergedTournaments.forEach(t => {
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

  private mergeTournaments(primary: Array<Tournament>, secondary: Array<Tournament>): Array<Tournament> {
    if (!primary || !primary.length) {
      return secondary && secondary.length ? secondary : [];
    }

    const merged = [...primary] as Array<Tournament>;
    secondary.forEach(tournamentTwo => {
      const tournamentOne = merged.find(candidate => candidate.id === tournamentTwo.id);
      if (!tournamentOne) {
        // That mean the tournament has been deleted in the most recent (primary) tournament list
        return;
      }

      if (!tournamentOne.timestamp) {
        tournamentOne.timestamp = Date.now();
      }
      if (!tournamentTwo.timestamp) {
        tournamentTwo.timestamp = Date.now();
      }

      if (tournamentOne.timestamp < tournamentTwo.timestamp) {
        tournamentOne.name = tournamentTwo.name;
        tournamentOne.type = tournamentTwo.type;
        tournamentOne.grid = tournamentTwo.grid;
        tournamentOne.matchs = tournamentTwo.matchs;
      }
    });

    return merged;
  }

  private async getBackendTournaments(): Promise<ProcedureContentStoredTournaments | null> {
    const backendData = (await this.httpRequest.load('/api/index.php/list/tournaments')) as ProcedureData;

    const procedure = new Procedure(backendData);
    if (procedure.isError()) {
      throw new Error(procedure.toString());
    }

    const procedureContent = procedure.getData() as ProcedureContentStoredTournaments;
    if (procedureContent && procedureContent.timestamp && Array.isArray(procedureContent.tournaments)) {
      return procedureContent;
    }

    return null;
  }

  private async storeBackendTournaments(content: ProcedureContentStoredTournaments): Promise<void> {
    const procedureData = (await this.httpRequest.post('/api/index.php/store/tournaments', JSON.stringify(content))) as ProcedureData;

    const procedure = new Procedure(procedureData);
    if (procedure.isError()) {
      throw new Error(procedure.toString());
    }
  }

  private async store(): Promise<number> {
    const content = { timestamp: Date.now(), tournaments: this.tournaments };

    localStorage.setItem(this.CACHE_KEY, JSON.stringify(content));

    this.throwOnUpdate();

    try {
      await this.storeBackendTournaments(content);
    } catch (e) {
      console.warn('[Tournaments] Unable to save the tournaments on the backend: ', e);
    }

    return this.tournaments.length;
  }

  private throwOnUpdate() {
    this.callbackCollector.forEach(callback => {
      setTimeout(() => {
        callback();
      });
    });
  }

  private resetScores(tournament: Tournament) {
    tournament.grid.forEach(team => {
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

    tournament.matchs.forEach(async match => {
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

  public async getTournamentTeam(tournament: Tournament, teamId: number | null): Promise<TeamRow | null> {
    if (!teamId) {
      return Promise.resolve(null);
    }

    const promise = this.isBusy || Promise.resolve();

    return promise.then(() => tournament.grid.find(team => team.id === teamId) || null);
  }

  public async remove(id: number): Promise<number> {
    if (!id) {
      return Promise.reject(new Error('[Tournaments.remove()] Missing tournament id.'));
    }

    const promise = this.isBusy || Promise.resolve();
    return promise.then(() => {
      this.tournaments = this.tournaments.filter(t => t.id !== id);
      return this.store();
    });
  }

  public async add(arg: { name: string; grid: Array<TeamRow>; matchs: Match[]; type: TournamentType }): Promise<number> {
    const { name, grid, matchs, type } = arg;
    const promise = this.isBusy || Promise.resolve();

    return promise.then(() => {
      this.tournaments.push({
        id: this.uuid.new(),
        name,
        grid,
        matchs,
        type,
      });

      return this.store();
    });
  }

  public async get(id: number | null): Promise<Tournament | null> {
    if (!id) {
      return Promise.resolve(null);
    }

    const promise = this.isBusy || Promise.resolve();

    return promise.then(() => this.tournaments.find(t => t.id === id) || null);
  }

  public async update(tournament: Tournament): Promise<number> {
    const promise = this.isBusy || Promise.resolve();

    return promise.then(() => {
      const i = this.tournaments.findIndex(t => t.id === tournament.id);

      if (i === -1) {
        console.warn('[Tournaments] Unable to update the tourmament #%s.', tournament.id);
        return this.tournaments.length;
      }

      this.updateScores(tournament);
      this.tournaments[i] = tournament;
      return this.store();
    });
  }

  public map(callback: Function): Array<any> {
    return this.tournaments.map((value: Tournament, index: number, array: Tournament[]) => callback(value, index, array));
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
}

const tournaments = new Tournaments();
export default tournaments;
