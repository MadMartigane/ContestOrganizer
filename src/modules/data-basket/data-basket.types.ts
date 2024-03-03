import { GenericTeam } from '../team-row/team-row.d';

export type BasketGridData = {
  team: GenericTeam;
  winGames: number;
  looseGames: number;
  winGamesPercent: number;
  concededPoints: number;
  scoredPoints: number;
};

export type BasketGridConfConstants = {
  concededPointsMin: number;
  scoredPointsMin: number;
  looseGamesMin: number;
  winGamesMin: number;
  winGamesPercentMin: number;
};
