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

  const sortedTeams = [...tournament.grid].sort((a, b) => {
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    return b.goalAverage - a.goalAverage;
  });

  const teamStats = sortedTeams.map((team) => {
    const matches = tournament.matchs.filter(
      (m) => m.hostId === team.id || m.visitorId === team.id
    );
    return {
      id: team.id,
      totalPlayed: matches.length,
    };
  });

  const team1Id = [...teamStats].sort((a, b) => {
    if (a.totalPlayed !== b.totalPlayed) {
      return a.totalPlayed - b.totalPlayed;
    }
    const rankA = sortedTeams.findIndex((t) => t.id === a.id);
    const rankB = sortedTeams.findIndex((t) => t.id === b.id);
    return rankA - rankB;
  })[0].id;

  const team2Id = [...teamStats]
    .filter((t) => t.id !== team1Id)
    .sort((a, b) => {
      const matchesAgainstT1A = tournament.matchs.filter(
        (m) =>
          (m.hostId === team1Id && m.visitorId === a.id) ||
          (m.hostId === a.id && m.visitorId === team1Id)
      ).length;
      const matchesAgainstT1B = tournament.matchs.filter(
        (m) =>
          (m.hostId === team1Id && m.visitorId === b.id) ||
          (m.hostId === b.id && m.visitorId === team1Id)
      ).length;

      if (matchesAgainstT1A !== matchesAgainstT1B) {
        return matchesAgainstT1A - matchesAgainstT1B;
      }

      const rankA = sortedTeams.findIndex((t) => t.id === a.id);
      const rankB = sortedTeams.findIndex((t) => t.id === b.id);
      return rankA - rankB;
    })[0].id;

  return [team1Id, team2Id];
}

const Matchs = {
  teamSortedByMatch,
  getAutoMatchTeams,
};

export default Matchs;
