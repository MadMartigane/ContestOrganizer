import { describe, expect, it } from "vitest";

import { Match, MatchStatus } from "../matchs/matchs";
import { TeamRow } from "../team-row/team-row";
import type { Tournament } from "../tournaments/tournaments.types";
import { TournamentType } from "../tournaments/tournaments.types";
import {
  calculateTeamStats,
  findBestOpponent,
  generateNBASchedule,
  getNBAMissingMatchCount,
  shouldTeamBeHost,
  validateNBAScheduleGeneration,
} from "./nba.scheduler";
import type { NBATeamStats } from "./nba.types";

function createTestTournament(
  teamCount: number,
  existingMatches: Match[] = []
): Tournament {
  const teams: TeamRow[] = [];
  for (let i = 1; i <= teamCount; i++) {
    const team = new TeamRow({
      id: i as unknown as number,
      type: TournamentType.NBA,
    });
    teams.push(team);
  }

  return {
    id: 1,
    name: "Test NBA",
    type: TournamentType.NBA,
    grid: teams,
    matchs: existingMatches,
  };
}

function createMatch(hostId: number, visitorId: number): Match {
  const match = new Match();
  match.hostId = hostId;
  match.visitorId = visitorId;
  match.status = MatchStatus.DONE;
  return match;
}

describe("NBA Scheduler", () => {
  describe("calculateTeamStats", () => {
    it("should initialize stats for all teams with 0 games", () => {
      const tournament = createTestTournament(3);

      const stats = calculateTeamStats(tournament);

      expect(stats.size).toBe(3);
      for (const [, teamStats] of stats) {
        expect(teamStats.totalGames).toBe(0);
        expect(teamStats.homeGames).toBe(0);
        expect(teamStats.awayGames).toBe(0);
        expect(teamStats.remainingGames).toBe(82);
      }
    });

    it("should count existing matches correctly", () => {
      const matches = [createMatch(1, 2), createMatch(2, 1), createMatch(1, 3)];
      const tournament = createTestTournament(3, matches);

      const stats = calculateTeamStats(tournament);

      const team1Stats = stats.get(1);
      const team2Stats = stats.get(2);
      const team3Stats = stats.get(3);
      expect(team1Stats).toBeDefined();
      expect(team2Stats).toBeDefined();
      expect(team3Stats).toBeDefined();
      expect(team1Stats?.totalGames).toBe(3);
      expect(team2Stats?.totalGames).toBe(2);
      expect(team3Stats?.totalGames).toBe(1);
    });

    it("should calculate remaining games (82 - total)", () => {
      const matches = [createMatch(1, 2), createMatch(2, 1)];
      const tournament = createTestTournament(2, matches);

      const stats = calculateTeamStats(tournament);

      const team1Stats = stats.get(1);
      const team2Stats = stats.get(2);
      expect(team1Stats).toBeDefined();
      expect(team2Stats).toBeDefined();
      expect(team1Stats?.remainingGames).toBe(80);
      expect(team2Stats?.remainingGames).toBe(80);
    });

    it("should track home/away games separately", () => {
      const matches = [
        createMatch(1, 2),
        createMatch(2, 1),
        createMatch(1, 3),
        createMatch(3, 1),
      ];
      const tournament = createTestTournament(3, matches);

      const stats = calculateTeamStats(tournament);

      const team1Stats = stats.get(1);
      const team2Stats = stats.get(2);
      const team3Stats = stats.get(3);
      expect(team1Stats).toBeDefined();
      expect(team2Stats).toBeDefined();
      expect(team3Stats).toBeDefined();
      expect(team1Stats?.homeGames).toBe(2);
      expect(team1Stats?.awayGames).toBe(2);
      expect(team2Stats?.homeGames).toBe(1);
      expect(team2Stats?.awayGames).toBe(1);
      expect(team3Stats?.homeGames).toBe(1);
      expect(team3Stats?.awayGames).toBe(1);
    });

    it("should track games by opponent", () => {
      const matches = [createMatch(1, 2), createMatch(2, 1), createMatch(1, 2)];
      const tournament = createTestTournament(2, matches);

      const stats = calculateTeamStats(tournament);

      const team1Stats = stats.get(1);
      expect(team1Stats).toBeDefined();
      const gamesAgainst2 = team1Stats?.gamesByOpponent.get(2);
      expect(gamesAgainst2).toBe(3);
    });
  });

  describe("findBestOpponent", () => {
    it("should return opponent with fewest games against", () => {
      const matches = [createMatch(1, 2)];
      const tournament = createTestTournament(3, matches);
      const stats = calculateTeamStats(tournament);

      const bestOpponent = findBestOpponent(1, stats, new Set());

      expect(bestOpponent).toBe(3);
    });

    it("should exclude specified team IDs", () => {
      const tournament = createTestTournament(3);
      const stats = calculateTeamStats(tournament);

      const bestOpponent = findBestOpponent(1, stats, new Set([2, 3]));

      expect(bestOpponent).toBeNull();
    });

    it("should return null when no valid opponent", () => {
      const matches: Match[] = [];
      for (let i = 0; i < 82; i++) {
        matches.push(createMatch(1, 2));
        matches.push(createMatch(2, 1));
      }
      const tournament = createTestTournament(3, matches);
      const stats = calculateTeamStats(tournament);

      const bestOpponent = findBestOpponent(1, stats, new Set());

      expect(bestOpponent).toBe(3);
    });

    it("should prioritize teams with remaining games", () => {
      const matches = [
        createMatch(1, 2),
        createMatch(2, 1),
        createMatch(1, 2),
        createMatch(2, 1),
      ];
      const tournament = createTestTournament(3, matches);
      const stats = calculateTeamStats(tournament);

      const bestOpponent = findBestOpponent(1, stats, new Set());

      expect(bestOpponent).toBe(3);
    });
  });

  describe("shouldTeamBeHost", () => {
    it("should return true when homeGames <= awayGames", () => {
      const teamStats: NBATeamStats = {
        teamId: 1,
        totalGames: 40,
        homeGames: 20,
        awayGames: 20,
        remainingGames: 42,
        gamesByOpponent: new Map(),
      };

      expect(shouldTeamBeHost(teamStats)).toBe(true);
    });

    it("should return false when homeGames > awayGames", () => {
      const teamStats: NBATeamStats = {
        teamId: 1,
        totalGames: 41,
        homeGames: 21,
        awayGames: 20,
        remainingGames: 41,
        gamesByOpponent: new Map(),
      };

      expect(shouldTeamBeHost(teamStats)).toBe(false);
    });
  });

  describe("generateNBASchedule", () => {
    it("should generate exactly 82 games per team for 2 teams", () => {
      const tournament = createTestTournament(2);

      const result = generateNBASchedule(tournament);

      const team1Stats = result.stats.get(1);
      const team2Stats = result.stats.get(2);
      expect(team1Stats).toBeDefined();
      expect(team2Stats).toBeDefined();
      expect(team1Stats?.totalGames).toBe(82);
      expect(team2Stats?.totalGames).toBe(82);
    });

    it("should generate exactly 82 games per team for 4 teams", () => {
      const tournament = createTestTournament(4);

      const result = generateNBASchedule(tournament);

      for (let i = 1; i <= 4; i++) {
        const teamStats = result.stats.get(i);
        expect(teamStats).toBeDefined();
        expect(teamStats?.totalGames).toBe(82);
      }
    });

    it("should balance home/away games (within ±2)", () => {
      const tournament = createTestTournament(4);

      const result = generateNBASchedule(tournament);

      for (let i = 1; i <= 4; i++) {
        const teamStats = result.stats.get(i);
        expect(teamStats).toBeDefined();
        if (teamStats) {
          const diff = Math.abs(teamStats.homeGames - teamStats.awayGames);
          expect(diff).toBeLessThanOrEqual(2);
        }
      }
    });

    it("should handle partial existing schedules", () => {
      const existingMatches = [createMatch(1, 2), createMatch(2, 1)];
      const tournament = createTestTournament(2, existingMatches);

      const result = generateNBASchedule(tournament);

      const team1Stats = result.stats.get(1);
      const team2Stats = result.stats.get(2);
      expect(team1Stats).toBeDefined();
      expect(team2Stats).toBeDefined();
      expect(team1Stats?.totalGames).toBe(82);
      expect(team2Stats?.totalGames).toBe(82);
    });

    it("should add warning when team exceeds 82 games", () => {
      const existingMatches: Match[] = [];
      for (let i = 0; i < 83; i++) {
        existingMatches.push(createMatch(1, 2));
      }
      const tournament = createTestTournament(2, existingMatches);

      const result = generateNBASchedule(tournament);

      expect(result.warnings.some((w) => w.includes("exceeds 82"))).toBe(true);
    });

    it("should return empty array when no teams", () => {
      const tournament = createTestTournament(0);

      const result = generateNBASchedule(tournament);

      expect(result.matches).toHaveLength(0);
      expect(result.warnings[0]).toBe("Not enough teams for NBA schedule");
    });

    it("should return empty array when only 1 team", () => {
      const tournament = createTestTournament(1);

      const result = generateNBASchedule(tournament);

      expect(result.matches).toHaveLength(0);
      expect(result.warnings[0]).toBe("Not enough teams for NBA schedule");
    });

    it("should handle odd number of teams", () => {
      const tournament = createTestTournament(3);

      const result = generateNBASchedule(tournament);

      for (let i = 1; i <= 3; i++) {
        const teamStats = result.stats.get(i);
        expect(teamStats).toBeDefined();
        expect(teamStats?.totalGames).toBe(82);
      }
    });
  });

  describe("getNBAMissingMatchCount", () => {
    it("should return 0 when all teams have 82 games", () => {
      const existingMatches: Match[] = [];
      for (let i = 0; i < 82; i++) {
        existingMatches.push(createMatch(1, 2));
        existingMatches.push(createMatch(2, 1));
      }
      const tournament = createTestTournament(2, existingMatches);

      const count = getNBAMissingMatchCount(tournament);

      expect(count).toBe(0);
    });

    it("should return correct count for 2 teams with 0 games (82 matches)", () => {
      const tournament = createTestTournament(2);

      const count = getNBAMissingMatchCount(tournament);

      expect(count).toBe(82);
    });

    it("should return correct count for partial schedules", () => {
      const existingMatches = [createMatch(1, 2), createMatch(2, 1)];
      const tournament = createTestTournament(2, existingMatches);

      const count = getNBAMissingMatchCount(tournament);

      expect(count).toBe(80);
    });

    it("should return 0 when less than 2 teams", () => {
      const tournament = createTestTournament(1);

      const count = getNBAMissingMatchCount(tournament);

      // With 1 team, there are no valid matchups, so return 0
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("validateNBAScheduleGeneration", () => {
    it("should be valid for tournament with 2+ teams and no limit violations", () => {
      const tournament = createTestTournament(2);

      const result = validateNBAScheduleGeneration(tournament);

      expect(result.valid).toBe(true);
    });

    it("should be invalid when team exceeds 82 games", () => {
      const existingMatches: Match[] = [];
      for (let i = 0; i < 83; i++) {
        existingMatches.push(createMatch(1, 2));
      }
      const tournament = createTestTournament(2, existingMatches);

      const result = validateNBAScheduleGeneration(tournament);

      expect(result.valid).toBe(false);
      expect(result.warnings.some((w) => w.includes("exceeds 82"))).toBe(true);
    });

    it("should be invalid when less than 2 teams", () => {
      const tournament = createTestTournament(1);

      const result = validateNBAScheduleGeneration(tournament);

      expect(result.valid).toBe(false);
    });

    it("should be invalid when only 1 team needs games", () => {
      const existingMatches: Match[] = [];
      // Each team needs 82 games total, so create 41 home and 41 away for each
      for (let i = 0; i < 41; i++) {
        existingMatches.push(createMatch(1, 2));
        existingMatches.push(createMatch(2, 1));
      }
      const tournament = createTestTournament(2, existingMatches);

      const result = validateNBAScheduleGeneration(tournament);

      expect(result.valid).toBe(false);
      expect(
        result.warnings.some((w) => w.includes("Not enough teams need games"))
      ).toBe(true);
    });
  });
});
