// Vitest tests for page-match component logic
import { describe, expect, it } from "vitest";

import { type Match, MatchStatus } from "../../modules/matchs/matchs";
import type { Tournament } from "../../modules/tournaments/tournaments.types";
import { calculateTargetMatchIndex } from "./page-match.logic";

describe("calculateTargetMatchIndex", () => {
  const baseTournament = {
    grid: [],
    id: 1,
    name: "Test Tournament",
    type: "Foot" as const,
    matchs: [] as never[],
  };

  it("should return null when no matches", () => {
    const tournament = { ...baseTournament, matchs: [] };
    expect(calculateTargetMatchIndex(tournament)).toBeNull();
  });

  it("should return null when tournament is undefined", () => {
    expect(calculateTargetMatchIndex(undefined)).toBeNull();
  });

  it("should return null when tournament is null", () => {
    expect(calculateTargetMatchIndex(null)).toBeNull();
  });

  it("should scroll to last DOING match", () => {
    const matches = [
      { id: 1, status: MatchStatus.DONE },
      { id: 2, status: MatchStatus.DOING },
      { id: 3, status: MatchStatus.PENDING },
      { id: 4, status: MatchStatus.DOING }, // Last DOING
    ] as unknown as Match[];
    const tournament = {
      matchs: matches,
    } as Tournament;
    expect(calculateTargetMatchIndex(tournament)).toBe(3);
  });

  it("should scroll to last DONE when no DOING", () => {
    const matches = [
      { id: 1, status: MatchStatus.PENDING },
      { id: 2, status: MatchStatus.DONE },
      { id: 3, status: MatchStatus.PENDING },
      { id: 4, status: MatchStatus.DONE }, // Last DONE
    ] as unknown as Match[];
    const tournament = {
      matchs: matches,
    } as Tournament;
    expect(calculateTargetMatchIndex(tournament)).toBe(3);
  });

  it("should return null when only PENDING matches", () => {
    const matches = [
      { id: 1, status: MatchStatus.PENDING },
      { id: 2, status: MatchStatus.PENDING },
    ] as unknown as Match[];
    const tournament = {
      matchs: matches,
    } as Tournament;
    expect(calculateTargetMatchIndex(tournament)).toBeNull();
  });

  it("should prioritize DOING over DONE", () => {
    const matches = [
      { id: 1, status: MatchStatus.DONE },
      { id: 2, status: MatchStatus.DOING },
      { id: 3, status: MatchStatus.DONE },
    ] as unknown as Match[];
    const tournament = {
      matchs: matches,
    } as Tournament;
    // Should return last DOING (index 1), not last DONE (index 2)
    expect(calculateTargetMatchIndex(tournament)).toBe(1);
  });

  it("should work with single DOING match", () => {
    const matches = [
      { id: 1, status: MatchStatus.PENDING },
      { id: 2, status: MatchStatus.DOING },
    ] as unknown as Match[];
    const tournament = {
      matchs: matches,
    } as Tournament;
    expect(calculateTargetMatchIndex(tournament)).toBe(1);
  });

  it("should work with single DONE match", () => {
    const matches = [
      { id: 1, status: MatchStatus.PENDING },
      { id: 2, status: MatchStatus.DONE },
    ] as unknown as Match[];
    const tournament = {
      matchs: matches,
    } as Tournament;
    expect(calculateTargetMatchIndex(tournament)).toBe(1);
  });

  it("should work with any number of matches (no threshold)", () => {
    const matches = [{ id: 1, status: MatchStatus.DONE }] as unknown as Match[];
    const tournament = {
      matchs: matches,
    } as Tournament;
    expect(calculateTargetMatchIndex(tournament)).toBe(0);
  });
});
