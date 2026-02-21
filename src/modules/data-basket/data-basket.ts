import { MatchStatus } from "../matchs/matchs";
import type TeamRow from "../team-row/team-row";
import type { Tournament } from "../tournaments/tournaments.types";
import type { BasketGridData } from "./data-basket.d";

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
  } as BasketGridData;

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
  const basketData = tournament.grid.map((teamRow) => {
    return getOneTeamData(tournament, teamRow);
  });

  basketData.sort(
    (teamA, teamB) =>
      (teamA?.concededPoints || 0) - (teamB?.concededPoints || 0)
  );
  basketData.sort(
    (teamA, teamB) => (teamB?.scoredPoints || 0) - (teamA?.scoredPoints || 0)
  );
  basketData.sort(
    (teamA, teamB) => (teamA?.looseGames || 0) - (teamB?.looseGames || 0)
  );
  basketData.sort(
    (teamA, teamB) => (teamB?.winGames || 0) - (teamA?.winGames || 0)
  );
  basketData.sort(
    (teamA, teamB) =>
      (teamB?.winGamesPercent || 0) - (teamA?.winGamesPercent || 0)
  );

  return basketData;
}

const Basket = {
  data,
  getOneTeamData,
};

export default Basket;
