import { describe, expect, it } from "vitest";
import type { Tournament, TournamentCollection } from "$lib/domain/types";
import { mergeCollections } from "$lib/services/merge";

const makeTournament = (id: string, timestamp: number): Tournament => ({
  id,
  name: `Tournament ${id}`,
  type: "Foot",
  grid: [],
  matchs: [],
  timestamp,
});

const makeCollection = (
  timestamp: number,
  tournaments: Tournament[] = []
): TournamentCollection => ({ timestamp, tournaments });

describe("mergeCollections", () => {
  it("returns empty collection when both sources are null", () => {
    const result = mergeCollections(null, null);
    expect(result.tournaments).toEqual([]);
    expect(typeof result.timestamp).toBe("number");
  });

  it("returns local copy when backend is null", () => {
    const local = makeCollection(100, [makeTournament("a", 100)]);
    const result = mergeCollections(local, null);
    expect(result.tournaments).toHaveLength(1);
    expect(result.tournaments[0].id).toBe("a");
  });

  it("returns backend copy when local is null", () => {
    const backend = makeCollection(200, [makeTournament("b", 200)]);
    const result = mergeCollections(null, backend);
    expect(result.tournaments).toHaveLength(1);
    expect(result.tournaments[0].id).toBe("b");
  });

  it("uses local as primary when local timestamp is higher", () => {
    const local = makeCollection(300, [makeTournament("a", 300)]);
    const backend = makeCollection(200, [makeTournament("b", 200)]);
    const result = mergeCollections(local, backend);
    // Primary = local, secondary-only "b" is discarded
    expect(result.tournaments).toHaveLength(1);
    expect(result.tournaments[0].id).toBe("a");
  });

  it("uses backend as primary when backend timestamp is higher", () => {
    const local = makeCollection(100, [makeTournament("a", 100)]);
    const backend = makeCollection(300, [makeTournament("b", 300)]);
    const result = mergeCollections(local, backend);
    // Primary = backend, secondary-only "a" is discarded
    expect(result.tournaments).toHaveLength(1);
    expect(result.tournaments[0].id).toBe("b");
  });

  it("picks tournament version with higher individual timestamp", () => {
    // Local collection is newer (300 vs 200)
    // But tournament "a" has a higher timestamp in backend
    const local = makeCollection(300, [makeTournament("a", 100)]);
    const backend = makeCollection(200, [makeTournament("a", 250)]);
    const result = mergeCollections(local, backend);
    expect(result.tournaments).toHaveLength(1);
    expect(result.tournaments[0].timestamp).toBe(250); // backend version wins
  });

  it("discards tournaments only in secondary", () => {
    const local = makeCollection(300, [makeTournament("a", 300)]);
    const backend = makeCollection(200, [
      makeTournament("a", 100),
      makeTournament("b", 200), // only in secondary
    ]);
    const result = mergeCollections(local, backend);
    expect(result.tournaments).toHaveLength(1);
    expect(result.tournaments[0].id).toBe("a");
  });

  it("does not mutate input objects", () => {
    const local = makeCollection(100, [makeTournament("a", 100)]);
    const backend = makeCollection(200, [makeTournament("b", 200)]);
    const localCopy = JSON.parse(JSON.stringify(local));
    const backendCopy = JSON.parse(JSON.stringify(backend));
    mergeCollections(local, backend);
    expect(local).toEqual(localCopy);
    expect(backend).toEqual(backendCopy);
  });

  it("handles equal collection timestamps (local wins as tiebreaker)", () => {
    const local = makeCollection(200, [makeTournament("a", 200)]);
    const backend = makeCollection(200, [makeTournament("a", 100)]);
    const result = mergeCollections(local, backend);
    expect(result.tournaments).toHaveLength(1);
    expect(result.tournaments[0].timestamp).toBe(200); // local wins
  });
});
