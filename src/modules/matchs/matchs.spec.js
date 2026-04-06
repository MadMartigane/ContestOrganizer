import { TeamRow } from "../team-row/team-row";
import { TournamentType } from "../tournaments/tournaments.types";
import Matchs, { Match, MatchStatus } from "./matchs";

describe("Matchs", () => {
  describe("getAutoMatchTeams", () => {
    it("should return null if there are less than 2 teams", () => {
      const tournament = {
        id: 1,
        name: "Test",
        type: TournamentType.FOOT,
        grid: [new TeamRow({ type: TournamentType.FOOT })],
        matchs: [],
      };
      expect(Matchs.getAutoMatchTeams(tournament)).toBeNull();
    });
    it("should select teams based on ranking when no matches have been played", () => {
      const team1 = new TeamRow({ id: 1, type: TournamentType.FOOT });
      team1.points = 10;
      const team2 = new TeamRow({ id: 2, type: TournamentType.FOOT });
      team2.points = 5;
      const team3 = new TeamRow({ id: 3, type: TournamentType.FOOT });
      team3.points = 0;
      const tournament = {
        id: 1,
        name: "Test",
        type: TournamentType.FOOT,
        grid: [team1, team2, team3],
        matchs: [],
      };
      // All teams have 0 matches, so Team1 is first in grid (team1)
      // Team2 candidates: team2, team3 - both have 0 confrontations vs team1
      // Tie-breaker: total matches (both 0), then LAST in grid (team3)
      expect(Matchs.getAutoMatchTeams(tournament)).toEqual([1, 3]);
    });
    it("should select teams that have played the least matches", () => {
      const team1 = new TeamRow({ id: 1, type: TournamentType.FOOT });
      const team2 = new TeamRow({ id: 2, type: TournamentType.FOOT });
      const team3 = new TeamRow({ id: 3, type: TournamentType.FOOT });
      const match = new Match(null, null, MatchStatus.DONE);
      match.hostId = 1;
      match.visitorId = 2;
      const tournament = {
        id: 1,
        name: "Test",
        type: TournamentType.FOOT,
        grid: [team1, team2, team3],
        matchs: [match],
      };
      // team3 has 0 matches, team1 and team2 have 1 match each.
      // Team1 = team3 (fewest total matches)
      // Team2 candidates: team1 and team2 both have 0 confrontations vs team3
      // Tie-breaker: same total matches (1), pick LAST in grid = team2
      expect(Matchs.getAutoMatchTeams(tournament)).toEqual([3, 2]);
    });
    it("should prioritize teams that haven't played against each other", () => {
      const team1 = new TeamRow({ id: 1, type: TournamentType.FOOT });
      const team2 = new TeamRow({ id: 2, type: TournamentType.FOOT });
      const team3 = new TeamRow({ id: 3, type: TournamentType.FOOT });
      const match1 = new Match(null, null, MatchStatus.DONE);
      match1.hostId = 1;
      match1.visitorId = 2;
      const match2 = new Match(null, null, MatchStatus.DONE);
      match2.hostId = 1;
      match2.visitorId = 3;
      const tournament = {
        id: 1,
        name: "Test",
        type: TournamentType.FOOT,
        grid: [team1, team2, team3],
        matchs: [match1, match2],
      };
      // team1: 2 matches
      // team2: 1 match
      // team3: 1 match
      // team1 vs team2: 1
      // team1 vs team3: 1
      // team2 vs team3: 0
      // team1Id will be team2 (1 match, rank 1 among those with 1 match)
      // team2Id will be team3 (0 matches against team2)
      expect(Matchs.getAutoMatchTeams(tournament)).toEqual([2, 3]);
    });
    it("should use goalAverage as tie-breaker for ranking", () => {
      const team1 = new TeamRow({ id: 1, type: TournamentType.FOOT });
      team1.points = 10;
      team1.goalAverage = 5;
      const team2 = new TeamRow({ id: 2, type: TournamentType.FOOT });
      team2.points = 10;
      team2.goalAverage = 10;
      const tournament = {
        id: 1,
        name: "Test",
        type: TournamentType.FOOT,
        grid: [team1, team2],
        matchs: [],
      };
      // All teams have 0 matches - Team1 is first in grid (team1)
      // Team2 is last in grid (team2)
      expect(Matchs.getAutoMatchTeams(tournament)).toEqual([1, 2]);
    });
    it("should handle all teams having same matches and confrontations", () => {
      const team1 = new TeamRow({ id: 1, type: TournamentType.FOOT });
      const team2 = new TeamRow({ id: 2, type: TournamentType.FOOT });
      const team3 = new TeamRow({ id: 3, type: TournamentType.FOOT });
      // All teams have played 1 match
      const match1 = new Match(null, null, MatchStatus.DONE);
      match1.hostId = 1;
      match1.visitorId = 2;
      const match2 = new Match(null, null, MatchStatus.DONE);
      match2.hostId = 2;
      match2.visitorId = 3;
      const tournament = {
        id: 1,
        name: "Test",
        type: TournamentType.FOOT,
        grid: [team1, team2, team3],
        matchs: [match1, match2],
      };
      // team1: 1 match, team2: 2 matches, team3: 1 match
      // team1 and team3 both have 1 match (min)
      // Team1 = first in grid with min matches = team1
      // Confrontations vs team1: team2 (1), team3 (0)
      // team3 has 0 confrontations vs team1, so team3 is selected
      expect(Matchs.getAutoMatchTeams(tournament)).toEqual([1, 3]);
    });
  });
});
