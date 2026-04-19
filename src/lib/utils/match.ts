import { generateId } from "$lib/domain/id";
import type {
  Match,
  MatchGoals,
  MatchStatus,
  TeamRow,
} from "$lib/domain/types";

/** Default match goals (0-0) */
export const DEFAULT_GOALS: MatchGoals = { host: 0, visitor: 0 };

/** Create a new match in PENDING status with 0-0 score */
export function createMatch(hostId: string, visitorId: string): Match {
  return {
    id: generateId(),
    hostId,
    visitorId,
    status: "PENDING" as MatchStatus,
    goals: { ...DEFAULT_GOALS },
  };
}

/** Count total matches per slot from the matches list */
function buildMatchCounts(
  teamsWithAssignments: TeamRow[],
  matches: Match[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const slot of teamsWithAssignments) {
    counts.set(slot.id, 0);
  }
  for (const match of matches) {
    if (counts.has(match.hostId)) {
      counts.set(match.hostId, (counts.get(match.hostId) ?? 0) + 1);
    }
    if (counts.has(match.visitorId)) {
      counts.set(match.visitorId, (counts.get(match.visitorId) ?? 0) + 1);
    }
  }
  return counts;
}

/** Find the team with fewest total matches (first in grid order on tie) */
function findHostWithFewestMatches(
  teamsWithAssignments: TeamRow[],
  matchCounts: Map<string, number>
): TeamRow {
  let hostSlot = teamsWithAssignments[0];
  let hostMatchCount = matchCounts.get(hostSlot.id) ?? 0;
  for (let i = 1; i < teamsWithAssignments.length; i++) {
    const count = matchCounts.get(teamsWithAssignments[i].id) ?? 0;
    if (count < hostMatchCount) {
      hostSlot = teamsWithAssignments[i];
      hostMatchCount = count;
    }
  }
  return hostSlot;
}

/** Count confrontations between host and each other team */
function buildConfrontationCounts(
  hostSlot: TeamRow,
  teamsWithAssignments: TeamRow[],
  matches: Match[]
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const slot of teamsWithAssignments) {
    if (slot.id === hostSlot.id) {
      continue;
    }
    counts.set(slot.id, 0);
  }
  for (const match of matches) {
    const isHost = match.hostId === hostSlot.id;
    const isVisitor = match.visitorId === hostSlot.id;
    if (!(isHost || isVisitor)) {
      continue;
    }
    const opponentId = isHost ? match.visitorId : match.hostId;
    if (counts.has(opponentId)) {
      counts.set(opponentId, (counts.get(opponentId) ?? 0) + 1);
    }
  }
  return counts;
}

/** Find opponent with fewest confrontations; tie-break: fewest total matches, then last in grid order */
function findBestOpponent(
  hostSlot: TeamRow,
  teamsWithAssignments: TeamRow[],
  confrontationCounts: Map<string, number>,
  matchCounts: Map<string, number>
): TeamRow | undefined {
  let visitorSlot: TeamRow | undefined;
  let visitorConfrontations = Number.POSITIVE_INFINITY;
  let visitorMatchCount = Number.POSITIVE_INFINITY;

  for (const slot of teamsWithAssignments) {
    if (slot.id === hostSlot.id) {
      continue;
    }
    const confrontations = confrontationCounts.get(slot.id) ?? 0;
    const totalMatches = matchCounts.get(slot.id) ?? 0;

    if (confrontations < visitorConfrontations) {
      visitorSlot = slot;
      visitorConfrontations = confrontations;
      visitorMatchCount = totalMatches;
    } else if (
      confrontations === visitorConfrontations &&
      totalMatches < visitorMatchCount
    ) {
      visitorSlot = slot;
      visitorConfrontations = confrontations;
      visitorMatchCount = totalMatches;
    }
    // If still tied, last in grid order wins (later index, so current loop iteration wins)
  }

  return visitorSlot;
}

/**
 * Auto-match algorithm:
 * 1. Find team with fewest total matches (scheduledMatchs).
 *    Tie: first in grid order.
 * 2. Find opponent with fewest previous confrontations against team 1.
 *    Tie: fewest total matches, then last in grid order.
 * Returns null if fewer than 2 teams with assignments.
 */
export function autoMatch(grid: TeamRow[], matches: Match[]): Match | null {
  const teamsWithAssignments = grid.filter((slot) => slot.team !== undefined);
  if (teamsWithAssignments.length < 2) {
    return null;
  }

  const matchCounts = buildMatchCounts(teamsWithAssignments, matches);
  const hostSlot = findHostWithFewestMatches(teamsWithAssignments, matchCounts);
  const confrontationCounts = buildConfrontationCounts(
    hostSlot,
    teamsWithAssignments,
    matches
  );
  const visitorSlot = findBestOpponent(
    hostSlot,
    teamsWithAssignments,
    confrontationCounts,
    matchCounts
  );

  if (!visitorSlot) {
    return null;
  }

  return createMatch(hostSlot.id, visitorSlot.id);
}

/** Per-team match statistics broken down by status */
export interface TeamMatchStats {
  /** Matches with DONE status only */
  played: number;
  /** Matches with PENDING or DOING status */
  scheduled: number;
  /** Total matches across all statuses */
  total: number;
}

/**
 * Build match stats per team from the grid and matches arrays.
 * Returns a Map keyed by TeamRow.id.
 * Skips grid slots without a team assignment.
 */
export function buildTeamMatchStats(
  grid: TeamRow[],
  matches: Match[]
): Map<string, TeamMatchStats> {
  const stats = new Map<string, TeamMatchStats>();
  for (const slot of grid) {
    if (slot.team === undefined) {
      continue;
    }
    stats.set(slot.id, { total: 0, played: 0, scheduled: 0 });
  }
  for (const match of matches) {
    for (const teamId of [match.hostId, match.visitorId]) {
      const s = stats.get(teamId);
      if (!s) {
        continue;
      }
      s.total++;
      if (match.status === "DONE") {
        s.played++;
      } else {
        s.scheduled++;
      }
    }
  }
  return stats;
}
