import type { Tournament, TournamentCollection } from "$lib/domain/types";

/**
 * Merge two tournament collections.
 *
 * Algorithm:
 * 1. If only one source exists → use it.
 * 2. If neither exists → return empty collection.
 * 3. If both exist:
 *    a. Collection with higher timestamp = primary.
 *    b. Start with primary's tournament list.
 *    c. For each tournament, if secondary has same `id` with higher
 *       individual timestamp, use secondary's version instead.
 *    d. Tournaments only in secondary → discarded.
 */
export function mergeCollections(
  local: TournamentCollection | null,
  backend: TournamentCollection | null
): TournamentCollection {
  if (!local) {
    if (!backend) {
      return { timestamp: Date.now(), tournaments: [] };
    }
    return { ...backend, tournaments: [...backend.tournaments] };
  }

  if (!backend) {
    return { ...local, tournaments: [...local.tournaments] };
  }

  // Both exist — TypeScript narrows both to TournamentCollection
  const primary = local.timestamp >= backend.timestamp ? local : backend;
  const secondary = primary === local ? backend : local;

  const secondaryById = new Map<string, Tournament>(
    secondary.tournaments.map((t) => [t.id, t])
  );

  const tournaments = primary.tournaments.map((pt) => {
    const st = secondaryById.get(pt.id);
    if (!st) {
      return pt;
    }
    return pt.timestamp >= st.timestamp ? pt : st;
  });

  return {
    timestamp: primary.timestamp,
    tournaments,
  };
}
