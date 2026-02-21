import { GenericTeam } from "../team-row/team-row.d";

export interface BasketGridData {
  concededPoints: number;
  looseGames: number;
  scoredPoints: number;
  team: GenericTeam;
  tournamentGridId: number;
  winGames: number;
  winGamesPercent: number;
}

export interface BasketGridConfConstants {
  concededPointsMin: number;
  looseGamesMin: number;
  scoredPointsMin: number;
  winGamesMin: number;
  winGamesPercentMin: number;
}
