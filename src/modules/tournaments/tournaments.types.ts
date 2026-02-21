import type { Match } from "../matchs/matchs";
import type TeamRow from "../team-row/team-row";

export interface Tournament {
  grid: TeamRow[];
  id: number;
  matchs: Match[];
  name: string;
  timestamp?: number;
  type: TournamentType;
}

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

export interface TournamentUpdateEvent {
  tournamentId: number;
}
