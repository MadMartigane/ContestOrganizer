import type { Match } from "../matchs/matchs";

/**
 * Statistics for a single team's schedule
 */
export interface NBATeamStats {
  awayGames: number;
  gamesByOpponent: Map<number, number>; // opponentId -> count
  homeGames: number;
  remainingGames: number;
  teamId: number;
  totalGames: number;
}

/**
 * Configuration for schedule generation
 */
export interface NBAScheduleConfig {
  maxGamesPerTeam: number;
  respectHomeAwayBalance: boolean;
}

/**
 * Result of schedule generation
 */
export interface NBAScheduleResult {
  matches: Match[];
  stats: Map<number, NBATeamStats>;
  warnings: string[];
}

/**
 * Default configuration for NBA schedule
 */
export const DEFAULT_NBA_CONFIG: NBAScheduleConfig = {
  maxGamesPerTeam: 82,
  respectHomeAwayBalance: true,
};
