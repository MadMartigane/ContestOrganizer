
import { Tournament } from "./tournaments.d";
import { CACHE_KEY } from "./tournaments.constants";
import uuid from "../uuid/uuid";
import TeamRow from "../team-row/team-row";


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

    // TODO remove backward compatibility
    const oldGridString = localStorage.getItem("CONTEST_GRID");
    if (oldGridString) {
      let oldGrid = [];
      try {
        oldGrid = JSON.parse(oldGridString);
      } catch (e) {
        console.warn("[Tournaments] Unable to parse old store tourmament. Cleanning the cache. ", e);
        localStorage.removeItem("CONTEST_GRID");
      }

      this.tournaments.push({
        id: this.uuid.new(),
        name: "Premier tournois",
        grid: oldGrid
      });
      localStorage.removeItem("CONTEST_GRID");
      this.store();
    }
    // end of TODO

    /* From stored data to instanciated object */
    this.tournaments.forEach((t) => {
      for (let i = 0, imax = t.grid.length; i < imax; i++) {
        const team = new TeamRow(t.grid[i].id);
        team.fromData(t.grid[i]);
        t.grid[i] = team;
      }
    });
  }

  private store () {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.tournaments));
    this.throwOnUpdate();
    return this.tournaments.length;
  }

  public remove(id: number): number {
    this.tournaments = this.tournaments.filter((t) => t.id !== id);
    return this.store();
  }

  public add (name: string, grid: Array<TeamRow>): number {
    this.tournaments.push({
      id: this.uuid.new(),
      name,
      grid
    });

    return this.store();
  }

  public get (id: number): Tournament | null {
    return this.tournaments.find((t) => t.id === id) || null;
  }

  public update (tournament: Tournament): number {
    const i = this.tournaments.findIndex((t) => t.id === tournament.id);

    if (i === -1) {
      console.warn("[Tournaments] Unable to update the tourmament #%s.", tournament.id);
      return;
    }

    this.tournaments[i] = tournament;
    return this.store();
  }

  public map (callback: Function): Array<any> {
    return this.tournaments.map((value: Tournament, index: number, array: Tournament[]) => callback(value, index, array));
  }

  private throwOnUpdate () {
    this.callbackCollector.forEach((callback) => {
      setTimeout(() => {
          callback();
      });
    });
  }

  public onUpdate (callback: Function) {
    this.callbackCollector.push(callback);
  }
}

const tournaments = new Tournaments();
export default tournaments;
