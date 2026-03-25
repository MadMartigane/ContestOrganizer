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
  balanceWindowSize?: number; // default: 5
  maxConsecutiveAppearances?: number; // default: 2
  maxGamesPerTeam: number;
  respectHomeAwayBalance: boolean;
}

/**
 * Context for real-time balance algorithm
 */
export interface NBABalanceContext {
  balanceWindowSize: number; // number of recent matches to track per team
  maxConsecutiveAppearances: number; // max allowed consecutive appearances per team
  recentMatches: Map<number, number[]>; // teamId → array of recent opponentIds (ordered by recency, most recent last)
}

/**
 * Score result for team balance evaluation
 */
export interface NBABalanceScore {
  consecutiveAppearances: number;
  remainingGames: number;
  score: number;
  teamId: number;
  totalGames: number;
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
