import { TeamRow } from "../team-row/team-row";
import type { Tournament } from "../tournaments/tournaments.types";
import { TournamentType } from "../tournaments/tournaments.types";
import Matchs, { Match, MatchStatus } from "./matchs";

describe("Matchs", () => {
  describe("getAutoMatchTeams", () => {
    it("should return null if there are less than 2 teams", () => {
      const tournament: Tournament = {
        id: 1,
        name: "Test",
        type: TournamentType.FOOT,
        grid: [new TeamRow({ type: TournamentType.FOOT })],
        matchs: [],
      };

      expect(Matchs.getAutoMatchTeams(tournament)).toBeNull();
    });

    it("should select teams based on ranking when no matches have been played", () => {
      const team1 = new TeamRow({ id: 1 as any, type: TournamentType.FOOT });
      team1.points = 10;
      const team2 = new TeamRow({ id: 2 as any, type: TournamentType.FOOT });
      team2.points = 5;
      const team3 = new TeamRow({ id: 3 as any, type: TournamentType.FOOT });
      team3.points = 0;

      const tournament: Tournament = {
        id: 1,
        name: "Test",
        type: TournamentType.FOOT,
        grid: [team1, team2, team3],
        matchs: [],
      };

      // team1 (10pts) vs team2 (5pts)
      expect(Matchs.getAutoMatchTeams(tournament)).toEqual([1, 2]);
    });

    it("should select teams that have played the least matches", () => {
      const team1 = new TeamRow({ id: 1 as any, type: TournamentType.FOOT });
      const team2 = new TeamRow({ id: 2 as any, type: TournamentType.FOOT });
      const team3 = new TeamRow({ id: 3 as any, type: TournamentType.FOOT });

      const match = new Match(null, null, MatchStatus.DONE as any);
      match.hostId = 1;
      match.visitorId = 2;

      const tournament: Tournament = {
        id: 1,
        name: "Test",
        type: TournamentType.FOOT,
        grid: [team1, team2, team3],
        matchs: [match],
      };

      // team3 has played 0 matches, team1 and team2 have played 1.
      // team1 is ranked higher than team2 (same points, but team1 is first in grid)
      // So it should be team3 vs team1
      expect(Matchs.getAutoMatchTeams(tournament)).toEqual([3, 1]);
    });

    it("should prioritize teams that haven't played against each other", () => {
      const team1 = new TeamRow({ id: 1 as any, type: TournamentType.FOOT });
      const team2 = new TeamRow({ id: 2 as any, type: TournamentType.FOOT });
      const team3 = new TeamRow({ id: 3 as any, type: TournamentType.FOOT });

      const match1 = new Match(null, null, MatchStatus.DONE as any);
      match1.hostId = 1;
      match1.visitorId = 2;

      const match2 = new Match(null, null, MatchStatus.DONE as any);
      match2.hostId = 1;
      match2.visitorId = 3;

      const tournament: Tournament = {
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
      const team1 = new TeamRow({ id: 1 as any, type: TournamentType.FOOT });
      team1.points = 10;
      team1.goalAverage = 5;

      const team2 = new TeamRow({ id: 2 as any, type: TournamentType.FOOT });
      team2.points = 10;
      team2.goalAverage = 10;

      const tournament: Tournament = {
        id: 1,
        name: "Test",
        type: TournamentType.FOOT,
        grid: [team1, team2],
        matchs: [],
      };

      // team2 has better goalAverage
      expect(Matchs.getAutoMatchTeams(tournament)).toEqual([2, 1]);
    });
  });
});
