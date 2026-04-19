import type { GenericTeam, TeamRow, TournamentType } from "$lib/domain/types";
import {
  getCachedNbaAllTeams,
  getStaleNbaAllTeams,
  hasStaleNbaCache,
  setCachedNbaAllTeams,
} from "$lib/services/team-cache";
import { fetchAllNbaTeams } from "$lib/services/team-search";
import { shuffleArray } from "$lib/utils/array";
import { createEmptySlot } from "$lib/utils/grid";

/**
 * Fill a tournament grid with missing NBA teams.
 *
 * 1. Deduplicate: collect existing team IDs from grid.
 * 2. Identify missing NBA teams not already in the grid.
 * 3. Shuffle missing teams (Fisher-Yates).
 * 4. Fill empty slots (team === undefined) with shuffled teams.
 * 5. Append remaining shuffled teams as new grid rows.
 * 6. Existing teams are NEVER removed or replaced.
 */
export const magicFillUp = (
  currentGrid: TeamRow[],
  allNbaTeams: GenericTeam[],
  type: TournamentType
): TeamRow[] => {
  // Step 1: Collect existing team IDs (deduplicate key)
  const existingIds = new Set<number>();
  for (const slot of currentGrid) {
    if (slot.team !== undefined) {
      existingIds.add(slot.team.id);
    }
  }

  // Step 2: Identify missing teams
  const missingTeams = allNbaTeams.filter((team) => !existingIds.has(team.id));

  if (missingTeams.length === 0) {
    return currentGrid;
  }

  // Step 3: Shuffle
  const shuffled = shuffleArray(missingTeams);

  // Step 4: Fill empty slots
  let index = 0;
  const newGrid = currentGrid.map((slot) => {
    if (slot.team === undefined && index < shuffled.length) {
      const team = shuffled[index];
      index += 1;
      return { ...slot, team };
    }
    return slot;
  });

  // Step 5: Append remaining teams as new slots
  const remaining: TeamRow[] = shuffled.slice(index).map((team) => ({
    ...createEmptySlot(type),
    team,
  }));

  return [...newGrid, ...remaining];
};

/**
 * Resolve all NBA teams with cache-first + stale-fallback strategy.
 * Throws only when no data is available at all.
 */
export const resolveNbaTeams = async (): Promise<GenericTeam[]> => {
  // Check fresh cache
  const cached = getCachedNbaAllTeams();
  if (cached) {
    return cached;
  }

  try {
    const teams = await fetchAllNbaTeams();
    setCachedNbaAllTeams(teams);
    return teams;
  } catch {
    // Fallback to stale cache
    if (hasStaleNbaCache()) {
      return getStaleNbaAllTeams() ?? [];
    }
    throw new Error("Failed to load NBA teams");
  }
};
