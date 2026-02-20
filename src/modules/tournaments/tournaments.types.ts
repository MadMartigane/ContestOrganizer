import type { Match } from "../matchs/matchs";
import type TeamRow from "../team-row/team-row";

export type Tournament = {
  id: number;
  name: string;
  grid: Array<TeamRow>;
  matchs: Array<Match>;
  type: TournamentType;
  timestamp?: number;
};

export enum TournamentType {
  FOOT = "Foot",
  BASKET = "Basket",
  NBA = "NBA",
  NFL = "NFL",
  RUGBY = "Rugby",
}

export enum TournamentTypeLabel {
  FOOT = "⚽ Foot",
  NBA = "🏀 NBA",
  BASKET = "🏀 Basket",
  NFL = "🏈 NFL",
  RUGBY = "🏉 Rugby",
}

export type TournamentUpdateEvent = {
  tournamentId: number;
};
