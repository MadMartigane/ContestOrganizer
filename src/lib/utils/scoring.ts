import { POINT_SYSTEMS, SPORT_CONFIG } from "$lib/domain/constants";
import type { Match, TeamRow, Tournament } from "$lib/domain/types";

/** Apply points for a common/football scorer type match result */
function applyCommonPoints(
  hostSlot: TeamRow | undefined,
  visitorSlot: TeamRow | undefined,
  hostGoals: number,
  visitorGoals: number
): void {
  const pointSystem = POINT_SYSTEMS.common;

  if (hostGoals > visitorGoals) {
    if (hostSlot) {
      hostSlot.points += pointSystem.win;
    }
    if (visitorSlot) {
      visitorSlot.points += pointSystem.loss;
    }
  } else if (hostGoals < visitorGoals) {
    if (hostSlot) {
      hostSlot.points += pointSystem.loss;
    }
    if (visitorSlot) {
      visitorSlot.points += pointSystem.win;
    }
  } else {
    if (hostSlot) {
      hostSlot.points += pointSystem.draw;
    }
    if (visitorSlot) {
      visitorSlot.points += pointSystem.draw;
    }
  }
}

/** Apply points for a basket scorer type match result (visitor wins on tie) */
function applyBasketPoints(
  hostSlot: TeamRow | undefined,
  visitorSlot: TeamRow | undefined,
  hostGoals: number,
  visitorGoals: number
): void {
  const pointSystem = POINT_SYSTEMS.basket;

  if (hostGoals > visitorGoals) {
    if (hostSlot) {
      hostSlot.points += pointSystem.win;
    }
  } else if (visitorSlot) {
    visitorSlot.points += pointSystem.win;
  }
}

/** Apply points for a rugby scorer type match result (visitor wins on tie) */
function applyRugbyPoints(
  hostSlot: TeamRow | undefined,
  visitorSlot: TeamRow | undefined,
  hostGoals: number,
  visitorGoals: number
): void {
  const pointSystem = POINT_SYSTEMS.rugby;

  if (hostGoals > visitorGoals) {
    if (hostSlot) {
      hostSlot.points += pointSystem.win;
    }
  } else if (visitorSlot) {
    visitorSlot.points += pointSystem.win;
  }
}

/** Dispatch point calculation based on scorer type */
function applyMatchPoints(
  hostSlot: TeamRow | undefined,
  visitorSlot: TeamRow | undefined,
  hostGoals: number,
  visitorGoals: number,
  scorerType: "common" | "basket" | "rugby"
): void {
  if (scorerType === "common") {
    applyCommonPoints(hostSlot, visitorSlot, hostGoals, visitorGoals);
  } else if (scorerType === "basket") {
    applyBasketPoints(hostSlot, visitorSlot, hostGoals, visitorGoals);
  } else if (scorerType === "rugby") {
    applyRugbyPoints(hostSlot, visitorSlot, hostGoals, visitorGoals);
  }
}

/**
 * Recalculate all grid stats from matches.
 * Resets all stats to 0, then replays all matches.
 * Preserves team assignments.
 */
export function recalculateGridStats(tournament: Tournament): Tournament {
  const sportConfig = SPORT_CONFIG[tournament.type];

  // Reset all stats, preserve team assignments
  const grid = tournament.grid.map((slot) => ({
    ...slot,
    points: 0,
    scoredGoals: 0,
    concededGoals: 0,
    goalAverage: 0,
    scheduledMatchs: 0,
  }));

  // Replay all matches
  for (const match of tournament.matchs) {
    const hostSlot = grid.find((s) => s.id === match.hostId);
    const visitorSlot = grid.find((s) => s.id === match.visitorId);

    // Increment scheduled matches for both teams (all statuses)
    if (hostSlot) {
      hostSlot.scheduledMatchs++;
    }
    if (visitorSlot) {
      visitorSlot.scheduledMatchs++;
    }

    // Accumulate stats for DONE matches only
    if (match.status !== "DONE") {
      continue;
    }

    const hostGoals = match.goals.host;
    const visitorGoals = match.goals.visitor;

    if (hostSlot) {
      hostSlot.scoredGoals += hostGoals;
      hostSlot.concededGoals += visitorGoals;
    }
    if (visitorSlot) {
      visitorSlot.scoredGoals += visitorGoals;
      visitorSlot.concededGoals += hostGoals;
    }

    applyMatchPoints(
      hostSlot,
      visitorSlot,
      hostGoals,
      visitorGoals,
      sportConfig.scorerType
    );
  }

  // Calculate goal average
  for (const slot of grid) {
    slot.goalAverage = slot.scoredGoals - slot.concededGoals;
  }

  return { ...tournament, grid };
}

/**
 * Compute basket-specific stats from matches for a given team.
 * Used for basket grid display (win%, played, won, lost).
 */
export interface BasketTeamStats {
  concededPoints: number;
  looseGames: number;
  playedGames: number;
  scheduledMatchs: number;
  scoredPoints: number;
  slotId: string;
  winGames: number;
  winGamesPercent: number;
}

export function computeBasketStats(
  grid: TeamRow[],
  matches: Match[]
): Map<string, BasketTeamStats> {
  const stats = new Map<string, BasketTeamStats>();

  // Initialize stats for all slots
  for (const slot of grid) {
    stats.set(slot.id, {
      slotId: slot.id,
      winGames: 0,
      looseGames: 0,
      winGamesPercent: 0,
      playedGames: 0,
      scoredPoints: 0,
      concededPoints: 0,
      scheduledMatchs: 0,
    });
  }

  // Compute from DONE matches
  for (const match of matches) {
    const hostStats = stats.get(match.hostId);
    const visitorStats = stats.get(match.visitorId);
    if (!(hostStats && visitorStats)) {
      continue;
    }

    hostStats.scheduledMatchs++;
    visitorStats.scheduledMatchs++;

    if (match.status !== "DONE") {
      continue;
    }

    hostStats.playedGames++;
    visitorStats.playedGames++;

    const hostGoals = match.goals.host;
    const visitorGoals = match.goals.visitor;

    hostStats.scoredPoints += hostGoals;
    hostStats.concededPoints += visitorGoals;
    visitorStats.scoredPoints += visitorGoals;
    visitorStats.concededPoints += hostGoals;

    if (hostGoals > visitorGoals) {
      hostStats.winGames++;
      visitorStats.looseGames++;
    } else {
      visitorStats.winGames++;
      hostStats.looseGames++;
    }
  }

  // Calculate win percentages
  for (const stat of stats.values()) {
    const total = stat.winGames + stat.looseGames;
    stat.winGamesPercent =
      total > 0 ? Math.round((stat.winGames / total) * 100) : 0;
  }

  return stats;
}
