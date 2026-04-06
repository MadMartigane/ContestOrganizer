import { describe, expect, it } from "vitest";
import { TeamRow } from "../team-row/team-row";
import { TournamentType } from "../tournaments/tournaments.types";
import { generateNBAScheduleMinimax } from "./nba.scheduler";

// Benchmark Configuration
const BENCHMARK_CONFIG = {
  teamCounts: [2, 4, 6, 8, 10],
  gamesPerTeam: 82,
  runsPerTest: 5,
};
/**
 * Helper to create test tournament
 */
function createTestTournament(teamCount) {
  const teams = [];
  for (let i = 1; i <= teamCount; i++) {
    const team = new TeamRow({
      id: i,
      type: TournamentType.NBA,
    });
    teams.push(team);
  }
  return {
    id: 1,
    name: "Test NBA Benchmark",
    type: TournamentType.NBA,
    grid: teams,
    matchs: [],
  };
}
describe("NBA Scheduler Benchmark", () => {
  describe("Performance: Execution Time", () => {
    for (const teamCount of BENCHMARK_CONFIG.teamCounts) {
      it(`minimax algorithm for ${teamCount} teams`, () => {
        const tournament = createTestTournament(teamCount);
        const times = [];
        for (let run = 0; run < BENCHMARK_CONFIG.runsPerTest; run++) {
          const start = performance.now();
          generateNBAScheduleMinimax(tournament);
          const end = performance.now();
          times.push(end - start);
        }
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        console.log(
          `minimax | ${teamCount} teams | avg: ${avgTime.toFixed(2)}ms | times: ${times.map((t) => t.toFixed(2)).join(", ")}ms`
        );
      });
    }
  });
  describe("Correctness: Game Count", () => {
    for (const teamCount of BENCHMARK_CONFIG.teamCounts) {
      const expectedTotalMatches =
        (teamCount * BENCHMARK_CONFIG.gamesPerTeam) / 2;
      it(`minimax produces exactly ${expectedTotalMatches} matches for ${teamCount} teams`, () => {
        const tournament = createTestTournament(teamCount);
        const result = generateNBAScheduleMinimax(tournament);
        expect(result.matches).toHaveLength(expectedTotalMatches);
      });
    }
  });
  describe("Correctness: Home/Away Balance (±2)", () => {
    // Test with 4 teams (as per original spec pattern)
    const teamCount = 4;
    it(`minimax maintains home/away balance for ${teamCount} teams`, () => {
      const tournament = createTestTournament(teamCount);
      const result = generateNBAScheduleMinimax(tournament);
      for (let i = 1; i <= teamCount; i++) {
        const teamStats = result.stats.get(i);
        expect(teamStats).toBeDefined();
        if (teamStats) {
          const diff = Math.abs(teamStats.homeGames - teamStats.awayGames);
          expect(diff).toBeLessThanOrEqual(2);
        }
      }
    });
  });
});
