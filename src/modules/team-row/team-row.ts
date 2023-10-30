import { GenericTeam, TeamRowProperties } from "./team-row.d";
import uuid from "../uuid/uuid";
import { TournamentType } from "../tournaments/tournaments.types";


export class TeamRow {
  public readonly id: number;
  public team?: GenericTeam;
  public points: number;
  public concededGoals: number;
  public scoredGoals: number;
  public goalAverage: number;
  public type: TournamentType;

  constructor(options: { id?: number, type: TournamentType }) {
    this.id = options.id || uuid.new();
    this.type = options.type;

    this.reset();
  }

  public toData(): TeamRowProperties {
    // TODO return Object.fromEntries(Object.entries(this) as any);
    return {
      id: this.id,
      team: this.team,
      type: this.type,
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
