import uuid from "../uuid/uuid";
export class TeamRow {
  id;
  team;
  points;
  concededGoals;
  scoredGoals;
  goalAverage;
  scheduledMatchs;
  type;
  constructor(options) {
    this.id = options.id || uuid.new();
    this.type = options.type;
    this.points = 0;
    this.concededGoals = 0;
    this.scoredGoals = 0;
    this.goalAverage = 0;
    this.scheduledMatchs = 0;
  }
  toData() {
    // TODO return Object.fromEntries(Object.entries(this) as any);
    return {
      id: this.id,
      team: this.team,
      type: this.type,
      points: this.points,
      concededGoals: this.concededGoals,
      scoredGoals: this.scoredGoals,
      goalAverage: this.goalAverage,
      scheduledMatchs: this.scheduledMatchs,
    };
  }
  fromData(data) {
    return Object.assign(this, data);
  }
  reset() {
    this.team = undefined;
    for (const key of [
      "points",
      "concededGoals",
      "scoredGoals",
      "goalAverage",
      "scheduledMatchs",
    ]) {
      this.set(key, "0");
    }
  }
  set(key, value) {
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
      case "scheduledMatchs": {
        this.scheduledMatchs = Number(value);
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
