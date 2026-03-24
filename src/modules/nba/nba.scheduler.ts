import { Match, MatchStatus } from "../matchs/matchs";
import type { Tournament } from "../tournaments/tournaments.types";
import { NBA_MAX_GAMES_PER_TEAM, NBA_MIN_TEAMS } from "./nba.constants";
import type {
  NBAScheduleConfig,
  NBAScheduleResult,
  NBATeamStats,
} from "./nba.types";

const DEFAULT_CONFIG: Required<NBAScheduleConfig> = {
  maxGamesPerTeam: 82,
  respectHomeAwayBalance: true,
};

function getRest(
  lastMatchIndexMap: Map<number, number>,
  teamId: number,
  currentIndex: number
): number {
  const lastMatch = lastMatchIndexMap.get(teamId) ?? -1;
  return lastMatch === -1 ? Number.MAX_SAFE_INTEGER : currentIndex - lastMatch;
}

function findAlternativeTeamWithGoodRest(
  stats: Map<number, NBATeamStats>,
  lastMatchIndexMap: Map<number, number>,
  currentIndex: number,
  maxRemaining: number,
  excludeTeamId: number
): number | null {
  for (const [teamId, teamStats] of stats) {
    if (teamId === excludeTeamId) {
      continue;
    }
    if (teamStats.remainingGames < maxRemaining) {
      continue;
    }
    if (getRest(lastMatchIndexMap, teamId, currentIndex) > 1) {
      return teamId;
    }
  }
  return null;
}

function getTeamWithMostRemainingGames(
  stats: Map<number, NBATeamStats>,
  lastMatchIndexMap: Map<number, number>,
  currentIndex: number
): number | null {
  let bestTeam: number | null = null;
  let maxRemaining = -1;
  let maxRest = -1;

  for (const [teamId, teamStats] of stats) {
    if (teamStats.remainingGames <= 0) {
      continue;
    }

    const rest = getRest(lastMatchIndexMap, teamId, currentIndex);

    if (teamStats.remainingGames > maxRemaining) {
      maxRemaining = teamStats.remainingGames;
      maxRest = rest;
      bestTeam = teamId;
    } else if (teamStats.remainingGames === maxRemaining && rest > maxRest) {
      maxRest = rest;
      bestTeam = teamId;
    }
  }

  // If bestTeam has rest=1, try to find alternative with rest>1 and same remaining
  if (bestTeam !== null) {
    const bestTeamRest = getRest(lastMatchIndexMap, bestTeam, currentIndex);

    if (bestTeamRest === 1) {
      const alternative = findAlternativeTeamWithGoodRest(
        stats,
        lastMatchIndexMap,
        currentIndex,
        maxRemaining,
        bestTeam
      );
      if (alternative !== null) {
        return alternative;
      }
    }
  }

  return bestTeam;
}

function createMatch(hostId: number, visitorId: number): Match {
  const match = new Match();
  match.hostId = hostId;
  match.visitorId = visitorId;
  match.status = MatchStatus.PENDING;
  return match;
}

function updateTeamStats(
  stats: Map<number, NBATeamStats>,
  teamId: number,
  opponentId: number,
  isHost: boolean
): void {
  const teamStats = stats.get(teamId);
  const opponentStats = stats.get(opponentId);

  if (!(teamStats && opponentStats)) {
    return;
  }

  teamStats.totalGames++;
  teamStats.remainingGames--;
  if (isHost) {
    teamStats.homeGames++;
  } else {
    teamStats.awayGames++;
  }

  const gamesAgainst = teamStats.gamesByOpponent.get(opponentId) || 0;
  teamStats.gamesByOpponent.set(opponentId, gamesAgainst + 1);

  opponentStats.totalGames++;
  opponentStats.remainingGames--;
  if (isHost) {
    opponentStats.awayGames++;
  } else {
    opponentStats.homeGames++;
  }

  const gamesAgainst2 = opponentStats.gamesByOpponent.get(teamId) || 0;
  opponentStats.gamesByOpponent.set(teamId, gamesAgainst2 + 1);
}

function collectOverLimitWarnings(stats: Map<number, NBATeamStats>): string[] {
  const warnings: string[] = [];

  for (const [, teamStats] of stats) {
    if (teamStats.totalGames > NBA_MAX_GAMES_PER_TEAM) {
      warnings.push(
        `Team ${teamStats.teamId} already has ${teamStats.totalGames} games (exceeds 82)`
      );
    }
  }

  return warnings;
}

/**
 * Calculate statistics for all teams in the tournament
 */
export function calculateTeamStats(
  tournament: Tournament
): Map<number, NBATeamStats> {
  const stats = new Map<number, NBATeamStats>();

  for (const team of tournament.grid) {
    const gamesByOpponent = new Map<number, number>();

    let homeGames = 0;
    let awayGames = 0;

    for (const match of tournament.matchs) {
      if (match.hostId === team.id) {
        homeGames++;
        const opponentId = match.visitorId;
        if (opponentId !== null) {
          gamesByOpponent.set(
            opponentId,
            (gamesByOpponent.get(opponentId) || 0) + 1
          );
        }
      } else if (match.visitorId === team.id) {
        awayGames++;
        const opponentId = match.hostId;
        if (opponentId !== null) {
          gamesByOpponent.set(
            opponentId,
            (gamesByOpponent.get(opponentId) || 0) + 1
          );
        }
      }
    }

    const totalGames = homeGames + awayGames;
    const remainingGames = NBA_MAX_GAMES_PER_TEAM - totalGames;

    stats.set(team.id, {
      teamId: team.id,
      totalGames,
      homeGames,
      awayGames,
      gamesByOpponent,
      remainingGames,
    });
  }

  return stats;
}

function calculateOpponentScore(
  opponentStats: NBATeamStats,
  totalGamesBetween: number,
  lastMatchIndexMap: Map<number, number> | undefined,
  currentIndex: number | undefined,
  opponentId: number
): number {
  let score = 10_000 - totalGamesBetween * 1000;
  score += opponentStats.remainingGames * 10;

  if (lastMatchIndexMap && currentIndex !== undefined) {
    const lastMatch = lastMatchIndexMap.get(opponentId) ?? -1;
    const rest = lastMatch === -1 ? 1000 : currentIndex - lastMatch;

    if (rest === 1) {
      score -= 50_000;
    } else {
      score += Math.min(rest, 100);
    }
  }

  return score;
}

/**
 * Find the best opponent for a team based on games played against each opponent
 */
export function findBestOpponent(
  teamId: number,
  stats: Map<number, NBATeamStats>,
  excludeTeamIds: Set<number>,
  lastMatchIndexMap?: Map<number, number>,
  currentIndex?: number
): number | null {
  const teamStats = stats.get(teamId);
  if (!teamStats) {
    return null;
  }

  // Always prefer opponents with rest > 1, fall back to rest=1 only if necessary
  const goodRestOpponents = collectOpponentsWithGoodRest(
    teamId,
    stats,
    excludeTeamIds,
    lastMatchIndexMap,
    currentIndex
  );

  if (goodRestOpponents.length > 0) {
    return findBestScoringOpponent(
      teamId,
      teamStats,
      goodRestOpponents,
      lastMatchIndexMap,
      currentIndex
    );
  }

  // Fall back to rest=1 opponents
  const allOpponents = collectAllOpponents(teamId, stats, excludeTeamIds);
  return findBestScoringOpponent(
    teamId,
    teamStats,
    allOpponents,
    lastMatchIndexMap,
    currentIndex
  );
}

function collectOpponentsWithGoodRest(
  teamId: number,
  stats: Map<number, NBATeamStats>,
  excludeTeamIds: Set<number>,
  lastMatchIndexMap: Map<number, number> | undefined,
  currentIndex: number | undefined
): Array<{ opponentId: number; opponentStats: NBATeamStats }> {
  const result: Array<{ opponentId: number; opponentStats: NBATeamStats }> = [];

  for (const [opponentId, opponentStats] of stats) {
    if (opponentId === teamId) {
      continue;
    }
    if (excludeTeamIds.has(opponentId)) {
      continue;
    }
    if (opponentStats.remainingGames <= 0) {
      continue;
    }

    const opponentRest =
      lastMatchIndexMap && currentIndex !== undefined
        ? getRest(lastMatchIndexMap, opponentId, currentIndex)
        : Number.MAX_SAFE_INTEGER;
    if (opponentRest === 1) {
      continue;
    }

    result.push({ opponentId, opponentStats });
  }

  return result;
}

function collectAllOpponents(
  teamId: number,
  stats: Map<number, NBATeamStats>,
  excludeTeamIds: Set<number>
): Array<{ opponentId: number; opponentStats: NBATeamStats }> {
  const result: Array<{ opponentId: number; opponentStats: NBATeamStats }> = [];

  for (const [opponentId, opponentStats] of stats) {
    if (opponentId === teamId) {
      continue;
    }
    if (excludeTeamIds.has(opponentId)) {
      continue;
    }
    if (opponentStats.remainingGames <= 0) {
      continue;
    }

    result.push({ opponentId, opponentStats });
  }

  return result;
}

function findBestScoringOpponent(
  teamId: number,
  teamStats: NBATeamStats,
  opponents: Array<{ opponentId: number; opponentStats: NBATeamStats }>,
  lastMatchIndexMap: Map<number, number> | undefined,
  currentIndex: number | undefined
): number | null {
  let bestOpponentId: number | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const { opponentId, opponentStats } of opponents) {
    const gamesAgainstOpponent = teamStats.gamesByOpponent.get(opponentId) || 0;
    const opponentGamesAgainstTeam =
      opponentStats.gamesByOpponent.get(teamId) || 0;
    const totalGamesBetween = gamesAgainstOpponent + opponentGamesAgainstTeam;

    const score = calculateOpponentScore(
      opponentStats,
      totalGamesBetween,
      lastMatchIndexMap,
      currentIndex,
      opponentId
    );

    if (score > bestScore) {
      bestScore = score;
      bestOpponentId = opponentId;
    }
  }

  return bestOpponentId;
}

/**
 * Determine if a team should be the host based on home/away balance
 */
export function shouldTeamBeHost(teamStats: NBATeamStats): boolean {
  return teamStats.homeGames <= teamStats.awayGames;
}

/**
 * Generate the NBA schedule for the tournament
 */
export function generateNBASchedule(
  tournament: Tournament,
  config?: NBAScheduleConfig
): NBAScheduleResult {
  const finalConfig = config
    ? { ...DEFAULT_CONFIG, ...config }
    : DEFAULT_CONFIG;

  const warnings: string[] = [];
  const matches: Match[] = [];

  if (tournament.grid.length < NBA_MIN_TEAMS) {
    return {
      matches,
      stats: new Map(),
      warnings: ["Not enough teams for NBA schedule"],
    };
  }

  const stats = calculateTeamStats(tournament);
  warnings.push(...collectOverLimitWarnings(stats));

  const lastMatchIndexMap = new Map<number, number>();
  for (const team of tournament.grid) {
    lastMatchIndexMap.set(team.id, -1);
  }

  const maxIterations = NBA_MAX_GAMES_PER_TEAM * tournament.grid.length;
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;

    const teamWithMostRemaining = getTeamWithMostRemainingGames(
      stats,
      lastMatchIndexMap,
      matches.length
    );

    if (teamWithMostRemaining === null) {
      break;
    }

    const excludeSet = new Set<number>([teamWithMostRemaining]);
    const opponentId = findBestOpponent(
      teamWithMostRemaining,
      stats,
      excludeSet,
      lastMatchIndexMap,
      matches.length
    );

    if (opponentId === null) {
      break;
    }

    const teamStats = stats.get(teamWithMostRemaining);
    if (!teamStats) {
      break;
    }

    const isHost = finalConfig.respectHomeAwayBalance
      ? shouldTeamBeHost(teamStats)
      : true;

    const match = createMatch(
      isHost ? teamWithMostRemaining : opponentId,
      isHost ? opponentId : teamWithMostRemaining
    );

    matches.push(match);
    lastMatchIndexMap.set(teamWithMostRemaining, matches.length - 1);
    lastMatchIndexMap.set(opponentId, matches.length - 1);
    updateTeamStats(stats, teamWithMostRemaining, opponentId, isHost);
  }

  return { matches, stats, warnings };
}

/**
 * Get the total number of matches needed to complete the NBA schedule
 */
export function getNBAMissingMatchCount(tournament: Tournament): number {
  const stats = calculateTeamStats(tournament);

  let totalRemaining = 0;
  for (const [, teamStats] of stats) {
    totalRemaining += Math.max(0, teamStats.remainingGames);
  }

  return Math.floor(totalRemaining / 2);
}

/**
 * Validate the tournament for NBA schedule generation
 */
export function validateNBAScheduleGeneration(tournament: Tournament): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (tournament.grid.length < NBA_MIN_TEAMS) {
    warnings.push(`Need at least ${NBA_MIN_TEAMS} teams for NBA schedule`);
    return { valid: false, warnings };
  }

  const stats = calculateTeamStats(tournament);

  let teamsOverLimit = 0;
  let teamsNeedGames = 0;

  for (const [, teamStats] of stats) {
    if (teamStats.totalGames > NBA_MAX_GAMES_PER_TEAM) {
      teamsOverLimit++;
      warnings.push(
        `Team ${teamStats.teamId} has ${teamStats.totalGames} games (exceeds ${NBA_MAX_GAMES_PER_TEAM})`
      );
    }
    if (teamStats.remainingGames > 0) {
      teamsNeedGames++;
    }
  }

  if (teamsOverLimit > 0) {
    return { valid: false, warnings };
  }

  if (teamsNeedGames < NBA_MIN_TEAMS) {
    warnings.push("Not enough teams need games to generate a schedule");
    return { valid: false, warnings };
  }

  return { valid: true, warnings };
}
