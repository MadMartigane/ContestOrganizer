import { NBA_MAX_GAMES_PER_TEAM, NBA_MIN_TEAMS } from "$lib/domain/constants";
import type { Match, TeamRow } from "$lib/domain/types";
import { createMatch } from "$lib/utils/match";

// ──────────────────────────────────────────────────
// Public Types
// ──────────────────────────────────────────────────

/** Validation warning for pre-generation checks */
export interface NbaValidationWarning {
  message: string;
  teamId?: string;
  teamName?: string;
}

// ──────────────────────────────────────────────────
// Internal Types
// ──────────────────────────────────────────────────

interface NbaTeamScheduleStats {
  awayGames: number;
  gamesByOpponent: Map<string, number>;
  homeGames: number;
  lastMatchIndex: number;
  remainingGames: number;
  slotId: string;
  totalGames: number;
}

// ──────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────

/** Filter grid to only assigned teams (those that have a team) */
function getAssignedTeams(grid: TeamRow[]): TeamRow[] {
  return grid.filter((row) => row.team !== undefined);
}

/** Build schedule stats for each assigned team from existing matches */
function buildScheduleStats(
  assignedTeams: TeamRow[],
  matches: Match[]
): Map<string, NbaTeamScheduleStats> {
  const stats = new Map<string, NbaTeamScheduleStats>();

  for (const row of assignedTeams) {
    stats.set(row.id, {
      awayGames: 0,
      gamesByOpponent: new Map<string, number>(),
      homeGames: 0,
      lastMatchIndex: -1,
      remainingGames: NBA_MAX_GAMES_PER_TEAM,
      slotId: row.id,
      totalGames: 0,
    });
  }

  for (let matchIndex = 0; matchIndex < matches.length; matchIndex++) {
    const match = matches[matchIndex];
    const hostStats = stats.get(match.hostId);
    const visitorStats = stats.get(match.visitorId);

    if (hostStats) {
      hostStats.totalGames += 1;
      hostStats.homeGames += 1;
      hostStats.remainingGames = NBA_MAX_GAMES_PER_TEAM - hostStats.totalGames;
      hostStats.lastMatchIndex = matchIndex;

      const opponentCount = hostStats.gamesByOpponent.get(match.visitorId) ?? 0;
      hostStats.gamesByOpponent.set(match.visitorId, opponentCount + 1);
    }

    if (visitorStats) {
      visitorStats.totalGames += 1;
      visitorStats.awayGames += 1;
      visitorStats.remainingGames =
        NBA_MAX_GAMES_PER_TEAM - visitorStats.totalGames;
      visitorStats.lastMatchIndex = matchIndex;

      const opponentCount = visitorStats.gamesByOpponent.get(match.hostId) ?? 0;
      visitorStats.gamesByOpponent.set(match.hostId, opponentCount + 1);
    }
  }

  return stats;
}

/** Compute rest value for a team at a given index */
function computeRest(
  teamStats: NbaTeamScheduleStats,
  currentIndex: number
): number {
  if (teamStats.lastMatchIndex === -1) {
    return Number.POSITIVE_INFINITY;
  }
  return currentIndex - teamStats.lastMatchIndex;
}

/** Sort candidates by remainingGames DESC, then rest DESC */
function sortCandidatesByPriority(
  candidates: TeamRow[],
  stats: Map<string, NbaTeamScheduleStats>,
  currentIndex: number
): TeamRow[] {
  return [...candidates].sort((first, second) => {
    const firstStats = stats.get(first.id);
    const secondStats = stats.get(second.id);
    if (!(firstStats && secondStats)) {
      return 0;
    }

    if (secondStats.remainingGames !== firstStats.remainingGames) {
      return secondStats.remainingGames - firstStats.remainingGames;
    }

    const firstRest = computeRest(firstStats, currentIndex);
    const secondRest = computeRest(secondStats, currentIndex);
    return secondRest - firstRest;
  });
}

/** If primary has rest=1, try to find alternative with same remainingGames and rest > 1 */
function maybeSwapPrimaryWithBetterRest(
  sorted: TeamRow[],
  stats: Map<string, NbaTeamScheduleStats>,
  currentIndex: number
): TeamRow {
  const primaryStats = stats.get(sorted[0].id);
  if (!primaryStats) {
    return sorted[0];
  }

  const primaryRest = computeRest(primaryStats, currentIndex);
  if (primaryRest !== 1) {
    return sorted[0];
  }

  for (let altIdx = 1; altIdx < sorted.length; altIdx++) {
    const altStats = stats.get(sorted[altIdx].id);
    if (!altStats) {
      continue;
    }
    if (altStats.remainingGames !== primaryStats.remainingGames) {
      break;
    }
    if (computeRest(altStats, currentIndex) > 1) {
      return sorted[altIdx];
    }
  }

  return sorted[0];
}

/** Calculate rest bonus for opponent scoring */
function calculateRestBonus(opponentRest: number): number {
  if (opponentRest === 1) {
    return -50_000;
  }
  if (opponentRest === Number.POSITIVE_INFINITY) {
    return 100;
  }
  return Math.min(opponentRest, 100);
}

/** Select the best opponent from the pool */
function selectBestOpponent(
  pool: TeamRow[],
  primaryStats: NbaTeamScheduleStats,
  stats: Map<string, NbaTeamScheduleStats>,
  currentIndex: number,
  isFallback: boolean
): TeamRow | undefined {
  let bestOpponentRow: TeamRow | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;
  const fallbackPenalty = isFallback ? -100_000 : 0;

  for (const opponentRow of pool) {
    const opponentStats = stats.get(opponentRow.id);
    if (!opponentStats) {
      continue;
    }

    const totalGamesBetween =
      primaryStats.gamesByOpponent.get(opponentRow.id) ?? 0;

    const opponentRest = computeRest(opponentStats, currentIndex);
    const restBonus = calculateRestBonus(opponentRest);

    const score =
      fallbackPenalty +
      10_000 -
      totalGamesBetween * 1000 +
      opponentStats.remainingGames * 10 +
      restBonus;

    if (score > bestScore) {
      bestScore = score;
      bestOpponentRow = opponentRow;
    }
  }

  return bestOpponentRow;
}

/** Determine home and visitor IDs based on home game counts */
function determineHomeVisitor(
  primaryRow: TeamRow,
  opponentRow: TeamRow,
  stats: Map<string, NbaTeamScheduleStats>
): [hostId: string, visitorId: string] {
  const primaryStats = stats.get(primaryRow.id);
  const opponentStats = stats.get(opponentRow.id);
  const primaryHome = primaryStats?.homeGames ?? 0;
  const opponentHome = opponentStats?.homeGames ?? 0;

  if (primaryHome <= opponentHome) {
    return [primaryRow.id, opponentRow.id];
  }
  return [opponentRow.id, primaryRow.id];
}

/** Update stats after a match is created */
function updateStatsAfterMatch(
  hostId: string,
  visitorId: string,
  stats: Map<string, NbaTeamScheduleStats>,
  matchIndex: number
): void {
  const hostStats = stats.get(hostId);
  const visitorStats = stats.get(visitorId);

  if (hostStats) {
    hostStats.totalGames += 1;
    hostStats.homeGames += 1;
    hostStats.remainingGames = NBA_MAX_GAMES_PER_TEAM - hostStats.totalGames;
    hostStats.lastMatchIndex = matchIndex;
    const count = hostStats.gamesByOpponent.get(visitorId) ?? 0;
    hostStats.gamesByOpponent.set(visitorId, count + 1);
  }

  if (visitorStats) {
    visitorStats.totalGames += 1;
    visitorStats.awayGames += 1;
    visitorStats.remainingGames =
      NBA_MAX_GAMES_PER_TEAM - visitorStats.totalGames;
    visitorStats.lastMatchIndex = matchIndex;
    const count = visitorStats.gamesByOpponent.get(hostId) ?? 0;
    visitorStats.gamesByOpponent.set(hostId, count + 1);
  }
}

// ──────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────

/** Validate that NBA schedule generation can proceed */
export function validateNbaGeneration(
  grid: TeamRow[],
  matchs: Match[]
): NbaValidationWarning[] {
  const warnings: NbaValidationWarning[] = [];
  const assignedTeams = getAssignedTeams(grid);

  if (assignedTeams.length < NBA_MIN_TEAMS) {
    warnings.push({
      message: `At least ${NBA_MIN_TEAMS} assigned teams are required for NBA schedule generation`,
    });
  }

  const stats = buildScheduleStats(assignedTeams, matchs);

  for (const row of assignedTeams) {
    const teamStats = stats.get(row.id);
    if (teamStats && teamStats.totalGames > NBA_MAX_GAMES_PER_TEAM) {
      warnings.push({
        message: `Team has exceeded the maximum of ${NBA_MAX_GAMES_PER_TEAM} games`,
        teamId: row.id,
        teamName: row.team?.name,
      });
    }
  }

  const teamsWithRemaining = assignedTeams.filter((row) => {
    const teamStats = stats.get(row.id);
    return teamStats ? teamStats.remainingGames > 0 : false;
  });

  if (teamsWithRemaining.length < 2 && assignedTeams.length >= NBA_MIN_TEAMS) {
    warnings.push({
      message: "At least 2 teams must have remaining games to generate matches",
    });
  }

  return warnings;
}

/** Compute number of matches needed to complete the NBA season */
export function computeNbaMissingMatches(
  grid: TeamRow[],
  matchs: Match[]
): number {
  const assignedTeams = getAssignedTeams(grid);
  const stats = buildScheduleStats(assignedTeams, matchs);

  let totalMissing = 0;
  for (const row of assignedTeams) {
    const teamStats = stats.get(row.id);
    if (teamStats) {
      totalMissing += Math.max(
        0,
        NBA_MAX_GAMES_PER_TEAM - teamStats.totalGames
      );
    }
  }

  return Math.floor(totalMissing / 2);
}

/** Check if the NBA season is complete */
export function isNbaSeasonComplete(grid: TeamRow[], matchs: Match[]): boolean {
  const assignedTeams = getAssignedTeams(grid);
  if (assignedTeams.length === 0) {
    return false;
  }

  const stats = buildScheduleStats(assignedTeams, matchs);

  for (const row of assignedTeams) {
    const teamStats = stats.get(row.id);
    if (teamStats && teamStats.totalGames < NBA_MAX_GAMES_PER_TEAM) {
      return false;
    }
  }

  return true;
}

/** Generate all missing NBA matches using a greedy rest-based algorithm */
export function generateNbaSchedule(
  grid: TeamRow[],
  existingMatches: Match[]
): Match[] {
  const assignedTeams = getAssignedTeams(grid);
  const stats = buildScheduleStats(assignedTeams, existingMatches);
  const startIndex = existingMatches.length;
  const generatedMatches: Match[] = [];
  const maxIterations = NBA_MAX_GAMES_PER_TEAM * assignedTeams.length;
  let currentIndex = startIndex;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const candidates = assignedTeams.filter((row) => {
      const teamStats = stats.get(row.id);
      return teamStats ? teamStats.remainingGames > 0 : false;
    });

    if (candidates.length < 2) {
      break;
    }

    // Phase 2.1 — Select primary team
    const sorted = sortCandidatesByPriority(candidates, stats, currentIndex);
    const primaryRow = maybeSwapPrimaryWithBetterRest(
      sorted,
      stats,
      currentIndex
    );
    const primaryStats = stats.get(primaryRow.id);
    if (!primaryStats) {
      break;
    }

    // Phase 2.2 — Select opponent
    const opponentPool = candidates.filter((row) => row.id !== primaryRow.id);

    const preferredOpponents = opponentPool.filter((row) => {
      const opponentStats = stats.get(row.id);
      if (!opponentStats) {
        return false;
      }
      return computeRest(opponentStats, currentIndex) !== 1;
    });

    const poolToUse =
      preferredOpponents.length > 0 ? preferredOpponents : opponentPool;
    const isFallback = preferredOpponents.length === 0;

    const bestOpponentRow = selectBestOpponent(
      poolToUse,
      primaryStats,
      stats,
      currentIndex,
      isFallback
    );

    if (!bestOpponentRow) {
      break;
    }

    // Phase 2.3 — Home/away decision
    const [hostId, visitorId] = determineHomeVisitor(
      primaryRow,
      bestOpponentRow,
      stats
    );

    // Phase 2.4 — Create match
    const match = createMatch(hostId, visitorId);
    generatedMatches.push(match);

    // Phase 2.5 — Update stats
    updateStatsAfterMatch(hostId, visitorId, stats, currentIndex);
    currentIndex += 1;
  }

  return generatedMatches;
}
