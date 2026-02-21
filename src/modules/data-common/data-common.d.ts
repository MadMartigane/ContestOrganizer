import { GenericTeam } from "../team-row/team-row.d";

export interface CommonGridData {
  concededPoints: number;
  looseGames: number;
  scoredPoints: number;
  team: GenericTeam;
  tournamentGridId: number;
  winGames: number;
  winGamesPercent: number;
}

export interface CommonGridConfConstants {
  concededPointsMin: number;
  looseGamesMin: number;
  scoredPointsMin: number;
  winGamesMin: number;
  winGamesPercentMin: number;
}
