import type { Tournament } from "../tournaments/tournaments.types";
import uuid from "../uuid/uuid";

import type { Row } from "./matchs.d";

export type { Row } from "./matchs.d";
export const MatchStatus = {
  PENDING: "Pending",
  DOING: "Doing",
  DONE: "Done",
} as const;

export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

export const MatchTeamType = {
  HOST: "Host",
  VISITOR: "Visitor",
} as const;

export type MatchTeamType = (typeof MatchTeamType)[keyof typeof MatchTeamType];

export class Match {
  readonly id: number;
  hostId: number | null;
  visitorId: number | null;
  goals: { visitor: number; host: number };
  status: MatchStatus;

  constructor(host = null, visitor = null, status = MatchStatus.PENDING) {
    this.id = uuid.new();
    this.hostId = host;
    this.visitorId = visitor;
    this.goals = { host: 0, visitor: 0 };
    this.status = status;
  }
}

function teamSortedByMatch(tournament: Tournament): Row[] {
  const bulk = tournament.grid.map((teamRow) => {
    const row: Row = {
      selected: false,
      team: teamRow,
      scheduledMatchs: 0,
      doneMatchs: 0,
      totalMatchs: 0,
    };

    row.scheduledMatchs =
      tournament.matchs.filter((match) => {
        return (
          (match.status === MatchStatus.DOING ||
            match.status === MatchStatus.PENDING) &&
          (match.hostId === teamRow.id || match.visitorId === teamRow.id)
        );
      }).length || 0;

    row.doneMatchs =
      tournament.matchs.filter((match) => {
        return (
          match.status === MatchStatus.DONE &&
          (match.hostId === teamRow.id || match.visitorId === teamRow.id)
        );
      }).length || 0;

    row.totalMatchs = row.scheduledMatchs + row.doneMatchs;

    return row;
  });

  bulk.sort(
    (teamA, teamB) => (teamA?.doneMatchs || 0) - (teamB?.doneMatchs || 0)
  );
  bulk.sort(
    (teamA, teamB) =>
      (teamB?.scheduledMatchs || 0) - (teamA?.scheduledMatchs || 0)
  );

  return bulk;
}

function getAutoMatchTeams(tournament: Tournament): [number, number] | null {
  if (tournament.grid.length < 2) {
    return null;
  }

  // Calculate total matches per team (all statuses)
  const teamTotalMatches = new Map<number, number>();
  for (const team of tournament.grid) {
    const count = tournament.matchs.filter(
      (m) => m.hostId === team.id || m.visitorId === team.id
    ).length;
    teamTotalMatches.set(team.id, count);
  }

  // Find min total matches
  const teamMatchCounts = Array.from(teamTotalMatches.values());
  const minMatches = Math.min(...teamMatchCounts);

  // Get teams with min matches (preserve grid order - first in array)
  const teamsWithMin = tournament.grid.filter(
    (team) => teamTotalMatches.get(team.id) === minMatches
  );

  // Team1 = FIRST in grid order
  const team1 = teamsWithMin[0];
  const team1Id = team1.id;

  // Calculate confrontations against Team1
  const confrontations = new Map<number, number>();
  for (const team of tournament.grid) {
    if (team.id === team1Id) {
      continue;
    }
    const count = tournament.matchs.filter(
      (m) =>
        (m.hostId === team1Id && m.visitorId === team.id) ||
        (m.hostId === team.id && m.visitorId === team1Id)
    ).length;
    confrontations.set(team.id, count);
  }

  // Find min confrontations
  const confrontationCounts = Array.from(confrontations.values());
  const minConfrontations = Math.min(...confrontationCounts);

  // Get candidates with min confrontations
  const candidates = tournament.grid.filter(
    (team) =>
      team.id !== team1Id && confrontations.get(team.id) === minConfrontations
  );

  if (candidates.length === 1) {
    return [team1Id, candidates[0].id];
  }

  // Sort by: total matches ASC, then grid index DESC (last in grid)
  candidates.sort((a, b) => {
    const totalA = teamTotalMatches.get(a.id) ?? 0;
    const totalB = teamTotalMatches.get(b.id) ?? 0;
    if (totalA !== totalB) {
      return totalA - totalB;
    }
    // Same total: pick LAST in grid (higher index)
    const indexA = tournament.grid.findIndex((t) => t.id === a.id);
    const indexB = tournament.grid.findIndex((t) => t.id === b.id);
    return indexB - indexA;
  });

  return [team1Id, candidates[0].id];
}

const Matchs = {
  teamSortedByMatch,
  getAutoMatchTeams,
};

export default Matchs;
