import TeamRow from '../team-row/team-row';
import { Tournament } from '../tournaments/tournaments.types';
import { MatchStatus } from '../matchs/matchs.d';
import { CommonGridData } from './data-common.d';

export default class Common {
  public static data(tournament: Tournament) {
    const commonData = tournament.grid.map(teamRow => {
      return this.getOneTeamData(tournament, teamRow);
    });

    commonData.sort((teamA, teamB) => (teamA?.concededPoints || 0) - (teamB?.concededPoints || 0));
    commonData.sort((teamA, teamB) => (teamB?.scoredPoints || 0) - (teamA?.scoredPoints || 0));
    commonData.sort((teamA, teamB) => (teamA?.looseGames || 0) - (teamB?.looseGames || 0));
    commonData.sort((teamA, teamB) => (teamB?.winGames || 0) - (teamA?.winGames || 0));
    commonData.sort((teamA, teamB) => (teamB?.winGamesPercent || 0) - (teamA?.winGamesPercent || 0));

    return commonData;
  }

  public static getOneTeamData(tournament: Tournament, team: TeamRow) {
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

    tournament.matchs.forEach(match => {
      if (match.status !== MatchStatus.DONE) {
        return;
      }

      if (match.hostId !== teamId && match.visitorId !== teamId) {
        return;
      }

      if (match.hostId === teamId) {
        gridData.scoredPoints += match.goals.host;
        gridData.concededPoints += match.goals.visitor;

        match.goals.host > match.goals.visitor ? gridData.winGames++ : gridData.looseGames++;
      } else {
        gridData.scoredPoints += match.goals.visitor;
        gridData.concededPoints += match.goals.host;

        match.goals.host > match.goals.visitor ? gridData.looseGames++ : gridData.winGames++;
      }

      gridData.winGamesPercent = Math.round((gridData.winGames / (gridData.winGames + gridData.looseGames)) * 100);
    });

    return gridData;
  }
}
