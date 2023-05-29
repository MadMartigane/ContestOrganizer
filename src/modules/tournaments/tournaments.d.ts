
import TeamRow from "../team-row/team-row";
import { Match } from "./tournaments";

export interface Tournament {
  id: number,
  name: string,
  grid: Array<TeamRow>,
  matchs: Array<Match>
}
