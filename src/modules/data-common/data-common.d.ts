import { GenericTeam } from '../team-row/team-row.d';

export type CommonGridData = {
  team: GenericTeam;
  winGames: number;
  looseGames: number;
  winGamesPercent: number;
  concededPoints: number;
  scoredPoints: number;
  tournamentGridId: number;
};

export type CommonGridConfConstants = {
  concededPointsMin: number;
  scoredPointsMin: number;
  looseGamesMin: number;
  winGamesMin: number;
  winGamesPercentMin: number;
};
