import { SPORT_CONFIG } from "$lib/domain/constants";
import type { Match, TeamRow, TournamentType } from "$lib/domain/types";
import { computeBasketStats } from "$lib/utils/scoring";

/**
 * Sort grid for ranking display.
 * - Default (Foot): manual sort by points DESC, goalAverage DESC.
 *   Returns new sorted array. Does NOT mutate original.
 * - Basket (Basket/NBA/NFL/Rugby): automatic sort by
 *   win% DESC → wins DESC → losses ASC → scored DESC → conceded ASC.
 *   Returns new sorted array. Does NOT mutate original.
 */
export function sortGridByRank(
  grid: TeamRow[],
  matches: Match[],
  sportType: TournamentType
): TeamRow[] {
  const config = SPORT_CONFIG[sportType];

  if (config.gridModel === "default") {
    return sortDefaultGrid(grid);
  }

  return sortBasketGrid(grid, matches);
}

/** Default grid sort: points DESC, goalAverage DESC (stable sort) */
function sortDefaultGrid(grid: TeamRow[]): TeamRow[] {
  return [...grid].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return b.goalAverage - a.goalAverage;
  });
}

/** Basket grid sort: win% DESC → wins DESC → losses ASC → scored DESC → conceded ASC */
function sortBasketGrid(grid: TeamRow[], matches: Match[]): TeamRow[] {
  const stats = computeBasketStats(grid, matches);

  return [...grid].sort((a, b) => {
    const aStats = stats.get(a.id);
    const bStats = stats.get(b.id);

    // Default to 0 if stats not found
    const aWinPct = aStats?.winGamesPercent ?? 0;
    const bWinPct = bStats?.winGamesPercent ?? 0;

    // 1. Win percentage DESC
    if (bWinPct !== aWinPct) {
      return bWinPct - aWinPct;
    }

    const aWins = aStats?.winGames ?? 0;
    const bWins = bStats?.winGames ?? 0;

    // 2. Wins DESC
    if (bWins !== aWins) {
      return bWins - aWins;
    }

    const aLosses = aStats?.looseGames ?? 0;
    const bLosses = bStats?.looseGames ?? 0;

    // 3. Losses ASC
    if (aLosses !== bLosses) {
      return aLosses - bLosses;
    }

    // 4. Scored DESC
    if (b.scoredGoals !== a.scoredGoals) {
      return b.scoredGoals - a.scoredGoals;
    }

    // 5. Conceded ASC
    return a.concededGoals - b.concededGoals;
  });
}

/**
 * Get rank for each team based on sorted position.
 * Returns a Map of slotId → rank (1-indexed).
 */
export function getRankMap(
  grid: TeamRow[],
  matches: Match[],
  sportType: TournamentType
): Map<string, number> {
  const sorted = sortGridByRank(grid, matches, sportType);
  const rankMap = new Map<string, number>();
  sorted.forEach((slot, index) => {
    rankMap.set(slot.id, index + 1);
  });
  return rankMap;
}
