
import TeamRow from "../team-row/team-row";
import { Match } from "./tournaments";

export interface Tournament {
  id: number,
  name: string,
  grid: Array<TeamRow>,
  matchs: Array<Match>
  type: TournamentType
}

export const enum MatchTeamType { HOST = "Host", VISITOR = "Visitor" }

export const enum MatchStatus { PENDING = "Pending", DOING = "Doing", DONE = "Done" }

export const enum TournamentType {
  FOOT = "Foot",
  BASKET_NBA = "Basket_NBA"
}

export const enum TournamentTypeLabel {
  FOOT = "Foot ⚽️",
  BASKET_NBA = "Basket - NBA 🏀"
}
