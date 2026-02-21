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

export const TournamentType = {
  FOOT: "Foot",
  BASKET: "Basket",
  NBA: "NBA",
  NFL: "NFL",
  RUGBY: "Rugby",
} as const;

export type TournamentType =
  (typeof TournamentType)[keyof typeof TournamentType];

export const TournamentTypeLabel = {
  FOOT: "⚽ Foot",
  NBA: "🏀 NBA",
  BASKET: "🏀 Basket",
  NFL: "🏈 NFL",
  RUGBY: "🏉 Rugby",
} as const;

export type TournamentTypeLabel =
  (typeof TournamentTypeLabel)[keyof typeof TournamentTypeLabel];

export interface TournamentUpdateEvent {
  tournamentId: number;
}
