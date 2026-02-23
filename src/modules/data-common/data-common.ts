import { MatchStatus } from "../matchs/matchs";
import type TeamRow from "../team-row/team-row";
import type { Tournament } from "../tournaments/tournaments.types";
import type { CommonGridData } from "./data-common.d";

function getOneTeamData(tournament: Tournament, team: TeamRow) {
  const teamId = team.id;

  const gridData = {
    team: team.team,
    tournamentGridId: teamId,
    concededPoints: 0,
    scoredPoints: 0,
    winGames: 0,
    looseGames: 0,
    winGamesPercent: 0,
  } as CommonGridData;

  for (const match of tournament.matchs) {
    if (match.status !== MatchStatus.DONE) {
      continue;
    }

    if (match.hostId !== teamId && match.visitorId !== teamId) {
      continue;
    }

    if (match.hostId === teamId) {
      gridData.scoredPoints += match.goals.host;
      gridData.concededPoints += match.goals.visitor;

      match.goals.host > match.goals.visitor
        ? gridData.winGames++
        : gridData.looseGames++;
    } else {
      gridData.scoredPoints += match.goals.visitor;
      gridData.concededPoints += match.goals.host;

      match.goals.host > match.goals.visitor
        ? gridData.looseGames++
        : gridData.winGames++;
    }

    gridData.winGamesPercent = Math.round(
      (gridData.winGames / (gridData.winGames + gridData.looseGames)) * 100
    );
  }

  return gridData;
}

function data(tournament: Tournament) {
  const commonData = tournament.grid.map((teamRow) => {
    return getOneTeamData(tournament, teamRow);
  });

  commonData.sort(
    (teamA, teamB) =>
      (teamA?.concededPoints || 0) - (teamB?.concededPoints || 0)
  );
  commonData.sort(
    (teamA, teamB) => (teamB?.scoredPoints || 0) - (teamA?.scoredPoints || 0)
  );
  commonData.sort(
    (teamA, teamB) => (teamA?.looseGames || 0) - (teamB?.looseGames || 0)
  );
  commonData.sort(
    (teamA, teamB) => (teamB?.winGames || 0) - (teamA?.winGames || 0)
  );
  commonData.sort(
    (teamA, teamB) =>
      (teamB?.winGamesPercent || 0) - (teamA?.winGamesPercent || 0)
  );

  return commonData;
}

const Common = {
  data,
  getOneTeamData,
};

export default Common;
