export interface TeamRowProperties {
  id: number;
  name?: string;
  points: number;
  concededGoals: number;
  scoredGoals: number;
  goalAverage: number;
}
export class TeamRow {
  public id: number;
  public name?: string;
  public points: number;
  public concededGoals: number;
  public scoredGoals: number;
  public goalAverage: number;

  constructor (id: number) {
    this.id = id;
    this.reset();
  }

  public toData(): TeamRowProperties {
    // return Object.fromEntries(Object.entries(this) as any);
    return {
      id: this.id,
      name: this.name || "",
      points: this.points,
      concededGoals: this.concededGoals,
      scoredGoals: this.scoredGoals,
      goalAverage: this.goalAverage
    };
  }

  public fromData(data: TeamRowProperties): TeamRow {
    Object.keys(data).forEach((key) => this.set(key, data[key]));
    return this;
  }


  public reset () {
    this.name = null;
    ["points", "concededGoals", "scoredGoals", "goalAverage"]
      .forEach((key) => this.set(key, "0"));
  }

  public set(key: string, value: string): void {
    switch (key) {
      case "name": {
        this.name = String(value);
        break;
      }
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
