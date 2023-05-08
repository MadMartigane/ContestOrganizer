import { FutDBTeam } from "../futbd/futdb.d";

export interface TeamRowProperties {
  id: number;
  team?: FutDBTeam;
  points: number;
  concededGoals: number;
  scoredGoals: number;
  goalAverage: number;
}

