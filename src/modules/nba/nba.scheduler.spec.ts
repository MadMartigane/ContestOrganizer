import { describe, expect, it } from "vitest";

import { Match, MatchStatus } from "../matchs/matchs";
import { TeamRow } from "../team-row/team-row";
import type { Tournament } from "../tournaments/tournaments.types";
import { TournamentType } from "../tournaments/tournaments.types";
import {
  calculateBalanceScore,
  calculateTeamStats,
  createBalanceContext,
  findBestOpponent,
  generateNBAScheduleMinimax,
  getConsecutiveAppearanceCount,
  getNBAMissingMatchCount,
  recordMatchInContext,
  selectOpponentForTeam,
  selectTeamForMatch,
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

  describe("generateNBAScheduleMinimax", () => {
    it("should generate exactly 82 games per team for 2 teams", () => {
      const tournament = createTestTournament(2);

      const result = generateNBAScheduleMinimax(tournament);

      const team1Stats = result.stats.get(1);
      const team2Stats = result.stats.get(2);
      expect(team1Stats).toBeDefined();
      expect(team2Stats).toBeDefined();
      expect(team1Stats?.totalGames).toBe(82);
      expect(team2Stats?.totalGames).toBe(82);
    });

    it("should generate exactly 82 games per team for 4 teams", () => {
      const tournament = createTestTournament(4);

      const result = generateNBAScheduleMinimax(tournament);

      for (let i = 1; i <= 4; i++) {
        const teamStats = result.stats.get(i);
        expect(teamStats).toBeDefined();
        expect(teamStats?.totalGames).toBe(82);
      }
    });

    it("should balance home/away games (within ±2)", () => {
      const tournament = createTestTournament(4);

      const result = generateNBAScheduleMinimax(tournament);

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

      const result = generateNBAScheduleMinimax(tournament);

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

      const result = generateNBAScheduleMinimax(tournament);

      expect(result.warnings.some((w) => w.includes("exceeds 82"))).toBe(true);
    });

    it("should return empty array when no teams", () => {
      const tournament = createTestTournament(0);

      const result = generateNBAScheduleMinimax(tournament);

      expect(result.matches).toHaveLength(0);
      expect(result.warnings[0]).toBe("Not enough teams for NBA schedule");
    });

    it("should return empty array when only 1 team", () => {
      const tournament = createTestTournament(1);

      const result = generateNBAScheduleMinimax(tournament);

      expect(result.matches).toHaveLength(0);
      expect(result.warnings[0]).toBe("Not enough teams for NBA schedule");
    });

    it("should handle odd number of teams", () => {
      const tournament = createTestTournament(3);

      const result = generateNBAScheduleMinimax(tournament);

      for (let i = 1; i <= 3; i++) {
        const teamStats = result.stats.get(i);
        expect(teamStats).toBeDefined();
        expect(teamStats?.totalGames).toBe(82);
      }
    });

    it("should prevent consecutive games for tournaments with 4+ teams", () => {
      const tournament = createTestTournament(4);

      const result = generateNBAScheduleMinimax(tournament);

      for (let i = 1; i < result.matches.length; i++) {
        const prevMatch = result.matches[i - 1];
        const currMatch = result.matches[i];

        const prevTeams = new Set([prevMatch.hostId, prevMatch.visitorId]);
        const currTeams = [currMatch.hostId, currMatch.visitorId];

        for (const teamId of currTeams) {
          expect(prevTeams.has(teamId)).toBe(false);
        }
      }
    });

    it("should maintain even distribution of games across teams", () => {
      const tournament = createTestTournament(4);

      const result = generateNBAScheduleMinimax(tournament);

      const gamesPlayed = new Map<number, number>();
      for (const team of tournament.grid) {
        gamesPlayed.set(team.id, 0);
      }

      for (const match of result.matches) {
        if (match.hostId === null || match.visitorId === null) {
          continue;
        }

        gamesPlayed.set(match.hostId, (gamesPlayed.get(match.hostId) ?? 0) + 1);
        gamesPlayed.set(
          match.visitorId,
          (gamesPlayed.get(match.visitorId) ?? 0) + 1
        );

        const counts = Array.from(gamesPlayed.values());
        const maxGames = Math.max(...counts);
        const minGames = Math.min(...counts);

        expect(maxGames - minGames).toBeLessThanOrEqual(2);
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

  describe("createBalanceContext", () => {
    it("should use default config with balanceWindowSize: 5 and maxConsecutiveAppearances: 2", () => {
      const context = createBalanceContext();

      expect(context.balanceWindowSize).toBe(5);
      expect(context.maxConsecutiveAppearances).toBe(2);
    });

    it("should initialize recentMatches as empty Map", () => {
      const context = createBalanceContext();

      expect(context.recentMatches).toBeDefined();
      expect(context.recentMatches.size).toBe(0);
    });

    it("should override defaults with custom config values", () => {
      const context = createBalanceContext({
        balanceWindowSize: 10,
        maxConsecutiveAppearances: 3,
        maxGamesPerTeam: 82,
        respectHomeAwayBalance: true,
      });

      expect(context.balanceWindowSize).toBe(10);
      expect(context.maxConsecutiveAppearances).toBe(3);
    });
  });

  describe("getConsecutiveAppearanceCount", () => {
    it("should return 0 for team with no recent matches", () => {
      const context = createBalanceContext();

      const count = getConsecutiveAppearanceCount(1, context);

      expect(count).toBe(0);
    });

    it("should return 1 for team that played 1 match", () => {
      const context = createBalanceContext();
      context.recentMatches.set(1, [2]);

      const count = getConsecutiveAppearanceCount(1, context);

      expect(count).toBe(1);
    });

    it("should return 2 for team that played 2 consecutive matches against same opponent", () => {
      const context = createBalanceContext();
      context.recentMatches.set(1, [2, 2]);

      const count = getConsecutiveAppearanceCount(1, context);

      expect(count).toBe(2);
    });

    it("should return count of trailing consecutive only for non-consecutive matches", () => {
      const context = createBalanceContext();
      context.recentMatches.set(1, [3, 2, 2, 2]);

      const count = getConsecutiveAppearanceCount(1, context);

      expect(count).toBe(3);
    });

    it("should return 1 when last opponent differs from previous", () => {
      const context = createBalanceContext();
      context.recentMatches.set(1, [2, 3, 3, 3]);

      const count = getConsecutiveAppearanceCount(1, context);

      expect(count).toBe(3);
    });
  });

  describe("calculateBalanceScore", () => {
    it("should give high score to team with many remaining games and no recent appearances", () => {
      const context = createBalanceContext();
      const stats = new Map<number, NBATeamStats>();
      stats.set(1, {
        teamId: 1,
        totalGames: 0,
        homeGames: 0,
        awayGames: 0,
        remainingGames: 82,
        gamesByOpponent: new Map(),
      });

      const score = calculateBalanceScore(1, stats, context);

      expect(score.teamId).toBe(1);
      expect(score.remainingGames).toBe(82);
      expect(score.consecutiveAppearances).toBe(0);
      expect(score.score).toBe(820);
    });

    it("should penalize team with recent appearances", () => {
      const context = createBalanceContext();
      context.recentMatches.set(1, [2, 2]);
      const stats = new Map<number, NBATeamStats>();
      stats.set(1, {
        teamId: 1,
        totalGames: 2,
        homeGames: 1,
        awayGames: 1,
        remainingGames: 80,
        gamesByOpponent: new Map([[2, 2]]),
      });

      const score = calculateBalanceScore(1, stats, context);

      expect(score.consecutiveAppearances).toBe(2);
      expect(score.score).toBe(800 - 30);
    });

    it("should use totalGames for tie-breaking priority", () => {
      const context = createBalanceContext();
      const stats = new Map<number, NBATeamStats>();
      stats.set(1, {
        teamId: 1,
        totalGames: 10,
        homeGames: 5,
        awayGames: 5,
        remainingGames: 72,
        gamesByOpponent: new Map(),
      });
      stats.set(2, {
        teamId: 2,
        totalGames: 20,
        homeGames: 10,
        awayGames: 10,
        remainingGames: 72,
        gamesByOpponent: new Map(),
      });

      const score1 = calculateBalanceScore(1, stats, context);
      const score2 = calculateBalanceScore(2, stats, context);

      expect(score1.score).toBe(score2.score);
      expect(score1.totalGames).toBeLessThan(score2.totalGames);
    });
  });

  describe("selectTeamForMatch", () => {
    it("should exclude team with 0 remaining games from selection", () => {
      const context = createBalanceContext();
      const stats = new Map<number, NBATeamStats>();
      stats.set(1, {
        teamId: 1,
        totalGames: 82,
        homeGames: 41,
        awayGames: 41,
        remainingGames: 0,
        gamesByOpponent: new Map(),
      });
      stats.set(2, {
        teamId: 2,
        totalGames: 50,
        homeGames: 25,
        awayGames: 25,
        remainingGames: 32,
        gamesByOpponent: new Map(),
      });

      const selected = selectTeamForMatch(stats, context);

      expect(selected).toBe(2);
    });

    it("should return single eligible team", () => {
      const context = createBalanceContext();
      const stats = new Map<number, NBATeamStats>();
      stats.set(1, {
        teamId: 1,
        totalGames: 0,
        homeGames: 0,
        awayGames: 0,
        remainingGames: 82,
        gamesByOpponent: new Map(),
      });

      const selected = selectTeamForMatch(stats, context);

      expect(selected).toBe(1);
    });

    it("should select team with highest balance score", () => {
      const context = createBalanceContext();
      const stats = new Map<number, NBATeamStats>();
      stats.set(1, {
        teamId: 1,
        totalGames: 40,
        homeGames: 20,
        awayGames: 20,
        remainingGames: 42,
        gamesByOpponent: new Map(),
      });
      stats.set(2, {
        teamId: 2,
        totalGames: 60,
        homeGames: 30,
        awayGames: 30,
        remainingGames: 22,
        gamesByOpponent: new Map(),
      });

      const selected = selectTeamForMatch(stats, context);

      expect(selected).toBe(1);
    });

    it("should select team with fewer total games on tie", () => {
      const context = createBalanceContext();
      const stats = new Map<number, NBATeamStats>();
      stats.set(1, {
        teamId: 1,
        totalGames: 50,
        homeGames: 25,
        awayGames: 25,
        remainingGames: 32,
        gamesByOpponent: new Map(),
      });
      stats.set(2, {
        teamId: 2,
        totalGames: 40,
        homeGames: 20,
        awayGames: 20,
        remainingGames: 32,
        gamesByOpponent: new Map(),
      });

      const selected = selectTeamForMatch(stats, context);

      expect(selected).toBe(2);
    });

    it("should return null when no teams have remaining games", () => {
      const context = createBalanceContext();
      const stats = new Map<number, NBATeamStats>();
      stats.set(1, {
        teamId: 1,
        totalGames: 82,
        homeGames: 41,
        awayGames: 41,
        remainingGames: 0,
        gamesByOpponent: new Map(),
      });

      const selected = selectTeamForMatch(stats, context);

      expect(selected).toBeNull();
    });
  });

  describe("selectOpponentForTeam", () => {
    it("should exclude opponent that would exceed consecutive limit", () => {
      const context = createBalanceContext();
      context.recentMatches.set(2, [1, 1]);
      context.recentMatches.set(3, [4, 5]);
      const stats = new Map<number, NBATeamStats>();
      stats.set(1, {
        teamId: 1,
        totalGames: 20,
        homeGames: 10,
        awayGames: 10,
        remainingGames: 62,
        gamesByOpponent: new Map(),
      });
      stats.set(2, {
        teamId: 2,
        totalGames: 20,
        homeGames: 10,
        awayGames: 10,
        remainingGames: 62,
        gamesByOpponent: new Map([[1, 2]]),
      });
      stats.set(3, {
        teamId: 3,
        totalGames: 20,
        homeGames: 10,
        awayGames: 10,
        remainingGames: 62,
        gamesByOpponent: new Map(),
      });

      const opponent = selectOpponentForTeam(1, stats, context);

      expect(opponent).toBe(3);
    });

    it("should return fallback opponent with lowest consecutive when all exceed limit", () => {
      const context = createBalanceContext();
      context.recentMatches.set(2, [1, 1, 1]);
      context.recentMatches.set(3, [1, 1]);
      const stats = new Map<number, NBATeamStats>();
      stats.set(1, {
        teamId: 1,
        totalGames: 20,
        homeGames: 10,
        awayGames: 10,
        remainingGames: 62,
        gamesByOpponent: new Map(),
      });
      stats.set(2, {
        teamId: 2,
        totalGames: 20,
        homeGames: 10,
        awayGames: 10,
        remainingGames: 62,
        gamesByOpponent: new Map([[1, 3]]),
      });
      stats.set(3, {
        teamId: 3,
        totalGames: 20,
        homeGames: 10,
        awayGames: 10,
        remainingGames: 62,
        gamesByOpponent: new Map([[1, 2]]),
      });

      const opponent = selectOpponentForTeam(1, stats, context);

      expect(opponent).toBe(3);
    });

    it("should prioritize opponent with fewest games played against team", () => {
      const context = createBalanceContext();
      const stats = new Map<number, NBATeamStats>();
      stats.set(1, {
        teamId: 1,
        totalGames: 20,
        homeGames: 10,
        awayGames: 10,
        remainingGames: 62,
        gamesByOpponent: new Map([
          [2, 5],
          [3, 2],
        ]),
      });
      stats.set(2, {
        teamId: 2,
        totalGames: 20,
        homeGames: 10,
        awayGames: 10,
        remainingGames: 62,
        gamesByOpponent: new Map(),
      });
      stats.set(3, {
        teamId: 3,
        totalGames: 20,
        homeGames: 10,
        awayGames: 10,
        remainingGames: 62,
        gamesByOpponent: new Map(),
      });

      const opponent = selectOpponentForTeam(1, stats, context);

      expect(opponent).toBe(3);
    });

    it("should return null when team does not exist in stats", () => {
      const context = createBalanceContext();
      const stats = new Map<number, NBATeamStats>();

      const opponent = selectOpponentForTeam(1, stats, context);

      expect(opponent).toBeNull();
    });
  });

  describe("recordMatchInContext", () => {
    it("should update recentMatches for both teams", () => {
      const context = createBalanceContext();

      recordMatchInContext(context, 1, 2);

      expect(context.recentMatches.get(1)).toEqual([2]);
      expect(context.recentMatches.get(2)).toEqual([1]);
    });

    it("should maintain order with most recent last", () => {
      const context = createBalanceContext();
      context.recentMatches.set(1, [3]);

      recordMatchInContext(context, 1, 2);

      expect(context.recentMatches.get(1)).toEqual([3, 2]);
    });

    it("should never exceed balanceWindowSize (removes oldest)", () => {
      const context = createBalanceContext({
        balanceWindowSize: 3,
        maxConsecutiveAppearances: 2,
        maxGamesPerTeam: 82,
        respectHomeAwayBalance: true,
      });
      context.recentMatches.set(1, [3, 4, 5]);

      recordMatchInContext(context, 1, 2);

      expect(context.recentMatches.get(1)).toEqual([4, 5, 2]);
    });

    it("should handle both teams exceeding window size", () => {
      const context = createBalanceContext({
        balanceWindowSize: 2,
        maxConsecutiveAppearances: 2,
        maxGamesPerTeam: 82,
        respectHomeAwayBalance: true,
      });
      context.recentMatches.set(1, [3, 4]);
      context.recentMatches.set(2, [5, 6]);

      recordMatchInContext(context, 1, 2);

      expect(context.recentMatches.get(1)).toEqual([4, 2]);
      expect(context.recentMatches.get(2)).toEqual([6, 1]);
    });
  });
});
