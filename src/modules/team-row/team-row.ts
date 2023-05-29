import { FutDBTeam } from "../futbd/futdb.d";
import { TeamRowProperties } from "./team-row.d";
import uuid from "../uuid/uuid";

export class TeamRow {
  public readonly id: number;
  public team?: FutDBTeam;
  public points: number;
  public concededGoals: number;
  public scoredGoals: number;
  public goalAverage: number;

  constructor (id?: number) {
    this.id = id || uuid.new();

    this.reset();
  }

  public toData(): TeamRowProperties {
    // TODO return Object.fromEntries(Object.entries(this) as any);
    return {
      id: this.id,
      team: this.team,
      points: this.points,
      concededGoals: this.concededGoals,
      scoredGoals: this.scoredGoals,
      goalAverage: this.goalAverage
    };
  }

  public fromData(data: TeamRowProperties): TeamRow {
    return Object.assign(this, data);
  }

  public reset () {
    delete this.team;
    ["points", "concededGoals", "scoredGoals", "goalAverage"]
      .forEach((key) => this.set(key, "0"));
  }

  public set(key: string, value: string): void {
    switch (key) {
      case "points": {
        this.points = Number(value);
        break;
      }
      case "concededGoals": {
        this.concededGoals = Number(value);
        break;
      }
      case "scoredGoals": {
        this.scoredGoals = Number(value);
        break;
      }
      case "goalAverage": {
        this.goalAverage = Number(value);
        break;
      }
    }
  }
}

export default TeamRow;
