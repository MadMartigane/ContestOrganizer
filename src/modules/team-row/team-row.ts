import type { TournamentType } from "../tournaments/tournaments.types";
import uuid from "../uuid/uuid";
import type { GenericTeam, TeamRowProperties } from "./team-row.d";

export class TeamRow {
  readonly id: number;
  team?: GenericTeam;
  points: number;
  concededGoals: number;
  scoredGoals: number;
  goalAverage: number;
  type: TournamentType;

  constructor(options: { id?: number; type: TournamentType }) {
    this.id = options.id || uuid.new();
    this.type = options.type;

    this.points = 0;
    this.concededGoals = 0;
    this.scoredGoals = 0;
    this.goalAverage = 0;
  }

  toData(): TeamRowProperties {
    // TODO return Object.fromEntries(Object.entries(this) as any);
    return {
      id: this.id,
      team: this.team,
      type: this.type,
      points: this.points,
      concededGoals: this.concededGoals,
      scoredGoals: this.scoredGoals,
      goalAverage: this.goalAverage,
    };
  }

  fromData(data: TeamRowProperties): TeamRow {
    return Object.assign(this, data);
  }

  reset() {
    this.team = undefined;
    for (const key of [
      "points",
      "concededGoals",
      "scoredGoals",
      "goalAverage",
    ]) {
      this.set(key, "0");
    }
  }

  set(key: string, value: string): void {
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
      default: {
        // Unknown key - no action needed
        break;
      }
    }
  }
}

export default TeamRow;
