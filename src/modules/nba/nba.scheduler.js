import { Match, MatchStatus } from "../matchs/matchs";
import { NBA_MAX_GAMES_PER_TEAM, NBA_MIN_TEAMS } from "./nba.constants";
export const createBalanceContext = (config) => ({
  balanceWindowSize: config?.balanceWindowSize ?? 5,
  maxConsecutiveAppearances: config?.maxConsecutiveAppearances ?? 2,
  recentMatches: new Map(),
});
export const getConsecutiveAppearanceCount = (teamId, context) => {
  const recentMatchArray = context.recentMatches.get(teamId);
  if (!recentMatchArray || recentMatchArray.length === 0) {
    return 0;
  }
  if (recentMatchArray.length === 1) {
    return 1;
  }
  let count = 1;
  const lastOpponent = recentMatchArray.at(-1);
  for (let i = recentMatchArray.length - 2; i >= 0; i--) {
    if (recentMatchArray[i] === lastOpponent) {
      count++;
    } else {
      break;
    }
  }
  return count;
};
export const recordMatchInContext = (context, hostId, visitorId) => {
  const hostRecent = context.recentMatches.get(hostId) ?? [];
  const visitorRecent = context.recentMatches.get(visitorId) ?? [];
  hostRecent.push(visitorId);
  visitorRecent.push(hostId);
  if (hostRecent.length > context.balanceWindowSize) {
    hostRecent.shift();
  }
  if (visitorRecent.length > context.balanceWindowSize) {
    visitorRecent.shift();
  }
  context.recentMatches.set(hostId, hostRecent);
  context.recentMatches.set(visitorId, visitorRecent);
};
export const calculateBalanceScore = (teamId, stats, context) => {
  const teamStats = stats.get(teamId);
  const consecutiveAppearances = getConsecutiveAppearanceCount(teamId, context);
  const remainingGames = teamStats?.remainingGames ?? 0;
  const totalGames = teamStats?.totalGames ?? 0;
  const score = remainingGames * 10 - consecutiveAppearances * 15;
  return {
    teamId,
    score,
    remainingGames,
    totalGames,
    consecutiveAppearances,
  };
};
/**
 * Select the team with the best balance score for the next match.
 * Replaces getTeamWithMostRemainingGames as the primary team selector.
 */
export const selectTeamForMatch = (stats, context) => {
  let bestTeamId = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestTotalGames = Number.POSITIVE_INFINITY;
  for (const [teamId, teamStats] of stats) {
    if (teamStats.remainingGames <= 0) {
      continue;
    }
    const balanceScore = calculateBalanceScore(teamId, stats, context);
    if (
      balanceScore.score > bestScore ||
      (balanceScore.score === bestScore &&
        balanceScore.totalGames < bestTotalGames)
    ) {
      bestScore = balanceScore.score;
      bestTeamId = teamId;
      bestTotalGames = balanceScore.totalGames;
    }
  }
  return bestTeamId;
};
const buildTemporaryContextWithOpponent = (teamId, opponentId, context) => {
  const tempContext = {
    balanceWindowSize: context.balanceWindowSize,
    maxConsecutiveAppearances: context.maxConsecutiveAppearances,
    recentMatches: new Map(),
  };
  for (const [tid, recentArr] of context.recentMatches) {
    tempContext.recentMatches.set(tid, [...recentArr]);
  }
  const opponentRecent = tempContext.recentMatches.get(opponentId) ?? [];
  opponentRecent.push(teamId);
  if (opponentRecent.length > tempContext.balanceWindowSize) {
    opponentRecent.shift();
  }
  tempContext.recentMatches.set(opponentId, opponentRecent);
  return tempContext;
};
const findEligibleOpponents = (teamId, stats, context) => {
  const teamStats = stats.get(teamId);
  if (!teamStats) {
    return [];
  }
  const eligible = [];
  for (const [opponentId, opponentStats] of stats) {
    if (opponentId === teamId) {
      continue;
    }
    if (opponentStats.remainingGames <= 0) {
      continue;
    }
    const tempContext = buildTemporaryContextWithOpponent(
      teamId,
      opponentId,
      context
    );
    const consecutiveAfterAdd = getConsecutiveAppearanceCount(
      opponentId,
      tempContext
    );
    if (consecutiveAfterAdd > context.maxConsecutiveAppearances) {
      continue;
    }
    const gamesAgainstTeam = teamStats.gamesByOpponent.get(opponentId) || 0;
    eligible.push({
      opponentId,
      gamesAgainstTeam,
      totalGames: opponentStats.totalGames,
    });
  }
  return eligible;
};
const findFallbackOpponent = (teamId, stats, context) => {
  let fallbackOpponentId = null;
  let lowestConsecutive = Number.POSITIVE_INFINITY;
  for (const [opponentId, opponentStats] of stats) {
    if (opponentId === teamId) {
      continue;
    }
    if (opponentStats.remainingGames <= 0) {
      continue;
    }
    const consecutive = getConsecutiveAppearanceCount(opponentId, context);
    if (consecutive < lowestConsecutive) {
      lowestConsecutive = consecutive;
      fallbackOpponentId = opponentId;
    }
  }
  return fallbackOpponentId;
};
const selectBestOpponentFromEligible = (eligible) => {
  let bestOpponentId = null;
  let bestGamesAgainst = Number.POSITIVE_INFINITY;
  let bestTotalGames = Number.POSITIVE_INFINITY;
  for (const opp of eligible) {
    if (
      opp.gamesAgainstTeam < bestGamesAgainst ||
      (opp.gamesAgainstTeam === bestGamesAgainst &&
        opp.totalGames < bestTotalGames)
    ) {
      bestGamesAgainst = opp.gamesAgainstTeam;
      bestTotalGames = opp.totalGames;
      bestOpponentId = opp.opponentId;
    }
  }
  return bestOpponentId;
};
/**
 * Select the best opponent for a team respecting consecutive appearance limits.
 */
export const selectOpponentForTeam = (teamId, stats, context) => {
  const teamStats = stats.get(teamId);
  if (!teamStats) {
    return null;
  }
  const eligibleOpponents = findEligibleOpponents(teamId, stats, context);
  if (eligibleOpponents.length === 0) {
    return findFallbackOpponent(teamId, stats, context);
  }
  return selectBestOpponentFromEligible(eligibleOpponents);
};
const DEFAULT_CONFIG = {
  balanceWindowSize: 5,
  maxConsecutiveAppearances: 2,
  maxGamesPerTeam: 82,
  respectHomeAwayBalance: true,
};
function createMatch(hostId, visitorId) {
  const match = new Match();
  match.hostId = hostId;
  match.visitorId = visitorId;
  match.status = MatchStatus.PENDING;
  return match;
}
function updateTeamStats(stats, teamId, opponentId, isHost) {
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
function collectOverLimitWarnings(stats) {
  const warnings = [];
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
export function calculateTeamStats(tournament) {
  const stats = new Map();
  for (const team of tournament.grid) {
    const gamesByOpponent = new Map();
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
/**
 * Find the best opponent for a team based on games played against each opponent
 */
export function findBestOpponent(teamId, stats, excludeTeamIds) {
  const teamStats = stats.get(teamId);
  if (!teamStats) {
    return null;
  }
  let bestOpponentId = null;
  let bestScore = Number.NEGATIVE_INFINITY;
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
    const gamesAgainstOpponent = teamStats.gamesByOpponent.get(opponentId) || 0;
    const opponentGamesAgainstTeam =
      opponentStats.gamesByOpponent.get(teamId) || 0;
    const totalGamesBetween = gamesAgainstOpponent + opponentGamesAgainstTeam;
    const score = 1000 - totalGamesBetween * 100;
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
export function shouldTeamBeHost(teamStats) {
  return teamStats.homeGames <= teamStats.awayGames;
}
/**
 * Get the total number of matches needed to complete the NBA schedule
 */
export function getNBAMissingMatchCount(tournament) {
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
export function validateNBAScheduleGeneration(tournament) {
  const warnings = [];
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
// ============ GREEDY REST-BASED ALGORITHM (MINIMAX) ============
function getRest(lastMatchIndexMap, teamId, currentIndex) {
  const lastMatch = lastMatchIndexMap.get(teamId) ?? -1;
  return lastMatch === -1 ? Number.MAX_SAFE_INTEGER : currentIndex - lastMatch;
}
function findAlternativeTeamWithGoodRest(
  stats,
  lastMatchIndexMap,
  currentIndex,
  maxRemaining,
  excludeTeamId
) {
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
function getTeamWithMostRemainingGames(stats, lastMatchIndexMap, currentIndex) {
  let bestTeam = null;
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
function calculateOpponentScore(
  opponentStats,
  totalGamesBetween,
  lastMatchIndexMap,
  currentIndex,
  opponentId
) {
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
function collectOpponentsWithGoodRest(
  teamId,
  stats,
  excludeTeamIds,
  lastMatchIndexMap,
  currentIndex
) {
  const result = [];
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
function collectAllOpponents(teamId, stats, excludeTeamIds) {
  const result = [];
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
  teamId,
  teamStats,
  opponents,
  lastMatchIndexMap,
  currentIndex
) {
  let bestOpponentId = null;
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
 * Find the best opponent for a team based on games played against each opponent (greedy algorithm)
 */
function findBestOpponentGreedy(
  teamId,
  stats,
  excludeTeamIds,
  lastMatchIndexMap,
  currentIndex
) {
  const teamStats = stats.get(teamId);
  if (!teamStats) {
    return null;
  }
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
  const allOpponents = collectAllOpponents(teamId, stats, excludeTeamIds);
  return findBestScoringOpponent(
    teamId,
    teamStats,
    allOpponents,
    lastMatchIndexMap,
    currentIndex
  );
}
/**
 * Generate the NBA schedule using the greedy rest-based algorithm (minimax).
 * Prioritizes teams with most remaining games and best rest between matches.
 */
export function generateNBAScheduleMinimax(tournament, config) {
  const finalConfig = config
    ? { ...DEFAULT_CONFIG, ...config }
    : DEFAULT_CONFIG;
  const warnings = [];
  const matches = [];
  if (tournament.grid.length < NBA_MIN_TEAMS) {
    return {
      matches,
      stats: new Map(),
      warnings: ["Not enough teams for NBA schedule"],
    };
  }
  const stats = calculateTeamStats(tournament);
  warnings.push(...collectOverLimitWarnings(stats));
  const lastMatchIndexMap = new Map();
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
    const excludeSet = new Set([teamWithMostRemaining]);
    const opponentId = findBestOpponentGreedy(
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
export const minimaxAlgorithm = {
  name: "minimax",
  fn: generateNBAScheduleMinimax,
  description:
    "Greedy rest-based algorithm selecting team with most remaining games",
};
