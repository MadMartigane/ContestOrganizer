import { describe, expect, it } from "vitest";
import { TournamentType } from "../tournaments/tournaments.types";
import {
  algorithms,
  getAlgorithmInfo,
  getAvailableAlgorithms,
  runWithAlgorithm,
} from "./nba.algorithms";

describe("NBA Algorithm Registry", () => {
  const createMockTournament = (teamCount) => {
    const teams = Array.from({ length: teamCount }, (_, i) => ({
      id: i + 1,
      name: `Team ${i + 1}`,
      type: TournamentType.NBA,
      points: 0,
      concededGoals: 0,
      scoredGoals: 0,
      goalAverage: 0,
      scheduledMatchs: 0,
    }));
    return {
      id: 1,
      name: "Test Tournament",
      type: TournamentType.NBA,
      grid: teams,
      matchs: [],
    };
  };
  const defaultConfig = {
    maxGamesPerTeam: 82,
    respectHomeAwayBalance: true,
  };
  describe("algorithms registry", () => {
    it("should contain only minimax algorithm", () => {
      const algorithmNames = Object.keys(algorithms);
      expect(algorithmNames).toContain("minimax");
      expect(algorithmNames).toHaveLength(1);
    });
    it("should have correct algorithm metadata", () => {
      expect(algorithms.minimax.name).toBe("minimax");
      expect(algorithms.minimax.description.length).toBeGreaterThan(0);
    });
    it("should have callable function for minimax algorithm", () => {
      expect(typeof algorithms.minimax.fn).toBe("function");
    });
  });
  describe("runWithAlgorithm", () => {
    it("should run minimax algorithm successfully", () => {
      const tournament = createMockTournament(4);
      const result = runWithAlgorithm("minimax", tournament, defaultConfig);
      expect(result).toBeDefined();
      expect(result.matches).toBeDefined();
      expect(result.stats).toBeDefined();
      expect(result.warnings).toBeDefined();
    });
    it("should throw error for invalid algorithm name", () => {
      const tournament = createMockTournament(4);
      expect(() =>
        runWithAlgorithm("invalid", tournament, defaultConfig)
      ).toThrow("Unknown algorithm: invalid");
    });
  });
  describe("getAvailableAlgorithms", () => {
    it("should return array with only minimax", () => {
      const available = getAvailableAlgorithms();
      expect(Array.isArray(available)).toBe(true);
      expect(available).toContain("minimax");
      expect(available).toHaveLength(1);
    });
  });
  describe("getAlgorithmInfo", () => {
    it("should return correct info for minimax", () => {
      const info = getAlgorithmInfo("minimax");
      expect(info.name).toBe("minimax");
      expect(info.description.length).toBeGreaterThan(0);
      expect(typeof info.fn).toBe("function");
    });
    it("should throw error for invalid algorithm name", () => {
      expect(() => getAlgorithmInfo("invalid")).toThrow(
        "Unknown algorithm: invalid"
      );
    });
  });
});
