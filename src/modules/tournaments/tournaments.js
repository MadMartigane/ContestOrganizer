/**
 * MIGRATION NOTE:
 * This module exports the Tournaments CLASS, not a singleton instance.
 *
 * During Stencil→Vanilla migration, both bundles were creating separate instances
 * at module load time, causing state synchronization issues.
 *
 * Use `getTournaments()` from `./init` instead of importing this directly.
 * This file will become the simple singleton export again when migration completes.
 */
import { HttpRequest } from "../http-request/http-request";
import { MatchStatus } from "../matchs/matchs";
import { Procedure } from "../procedure/procedure";
import TeamRow from "../team-row/team-row";
import uuid from "../uuid/uuid";
import { CACHE_KEY } from "./tournaments.constants";
import { TournamentType, TournamentTypeLabel } from "./tournaments.types";
export class Tournaments {
  CACHE_KEY;
  uuid;
  callbackCollector;
  httpRequest;
  tournaments;
  isBusy;
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
  buildCacheKey() {
    const pathName = window.location.pathname.replace(/\//g, "_");
    return `${pathName}_${CACHE_KEY}`;
  }
  getTournamentsCache(tryOldCach = false) {
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
  parseLocalTournaments(tournamentsString) {
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
  instantiateTournaments(tournaments) {
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
  async restore() {
    const tournamentsString = this.getTournamentsCache();
    const localTournaments = this.parseLocalTournaments(tournamentsString);
    let backendTournaments = null;
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
  getMergedTournaments(localTournaments, backendTournaments) {
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
  mergeTournaments(primaries, secondaries) {
    if (!primaries?.length) {
      return secondaries?.length ? secondaries : [];
    }
    const merged = [];
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
  async getBackendTournaments() {
    const backendData = await this.httpRequest.load(
      "/api/index.php/list/tournaments"
    );
    const procedure = new Procedure(backendData);
    if (procedure.isError()) {
      throw new Error(procedure.toString());
    }
    const procedureContent = procedure.getData();
    if (
      procedureContent?.timestamp &&
      Array.isArray(procedureContent.tournaments)
    ) {
      return procedureContent;
    }
    return null;
  }
  async storeBackendTournaments(content) {
    const procedureData = await this.httpRequest.post(
      "/api/index.php/store/tournaments",
      JSON.stringify(content)
    );
    const procedure = new Procedure(procedureData);
    if (procedure.isError()) {
      throw new Error(procedure.toString());
    }
  }
  getLastTimeStampInTournaments() {
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
  store(realLastTimeStamp) {
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
  throwOnUpdate() {
    for (const callback of this.callbackCollector) {
      setTimeout(() => {
        callback();
      });
    }
  }
  resetScores(tournament) {
    for (const team of tournament.grid) {
      team.concededGoals = 0;
      team.scoredGoals = 0;
      team.goalAverage = 0;
      team.points = 0;
      team.scheduledMatchs = 0;
    }
  }
  updateTeamScore(team, scoredGoals, concededGoals, isDraw, isWinner) {
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
  async updateScores(tournament) {
    if (!tournament.matchs || tournament.matchs.length === 0) {
      return;
    }
    this.resetScores(tournament);
    for (const match of tournament.matchs) {
      const host = await this.getTournamentTeam(tournament, match.hostId);
      const visitor = await this.getTournamentTeam(tournament, match.visitorId);
      if (host) {
        host.scheduledMatchs++;
      }
      if (visitor) {
        visitor.scheduledMatchs++;
      }
      if (match.status !== MatchStatus.DONE) {
        continue;
      }
      const vScore = match.goals.visitor || 0;
      const hScore = match.goals.host || 0;
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
  getTournamentTeam(tournament, teamId) {
    if (!teamId) {
      return Promise.resolve(null);
    }
    const promise = this.isBusy || Promise.resolve();
    return promise.then(
      () => tournament.grid.find((team) => team.id === teamId) || null
    );
  }
  remove(id) {
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
  add(arg) {
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
  get(id) {
    if (!id) {
      return Promise.resolve(null);
    }
    const promise = this.isBusy || Promise.resolve();
    return promise.then(
      () => this.tournaments.find((t) => t.id === id) || null
    );
  }
  async update(tournament) {
    await (this.isBusy || Promise.resolve());
    const i = this.tournaments.findIndex((t) => t.id === tournament.id);
    if (i === -1) {
      console.warn(
        "[Tournaments] Unable to update the tourmament #%s.",
        tournament.id
      );
      return Promise.resolve(this.tournaments.length);
    }
    await this.updateScores(tournament);
    tournament.timestamp = Date.now();
    this.tournaments[i] = tournament;
    return this.store();
  }
  map(callback) {
    return this.tournaments.map((value, index, array) =>
      callback(value, index, array)
    );
  }
  onUpdate(callback) {
    this.callbackCollector.push(callback);
    return () => {
      const index = this.callbackCollector.indexOf(callback);
      if (index > -1) {
        this.callbackCollector.splice(index, 1);
      }
    };
  }
  getTournamentTypeLabel(type) {
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
  static sortGrid(grid) {
    return [...grid].sort((a, b) => {
      if (a.points !== b.points) {
        return b.points - a.points;
      }
      return b.goalAverage - a.goalAverage;
    });
  }
}
// Helper functions for tournament operations
// These wrap the Tournaments class instance from getTournaments()
/**
 * Returns all tournaments as an array.
 */
export function getAllTournaments() {
  return window.__tournaments?.map((t) => t) ?? [];
}
/**
 * Navigates to tournament creation page.
 */
export function createTournament() {
  document.dispatchEvent(
    new CustomEvent("navigate", {
      detail: { hash: "#/tournaments" },
      bubbles: true,
      composed: true,
    })
  );
}
/**
 * Deletes a tournament by ID.
 */
export function deleteTournament(id) {
  return (
    window.__tournaments?.remove(id) ??
    Promise.reject(new Error("Tournaments not initialized"))
  );
}
// No singleton at module level - use getTournaments() from ../init instead
export default Tournaments;
