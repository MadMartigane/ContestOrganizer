import { createQuery } from "@tanstack/svelte-query";
import type { GenericTeam, TournamentType } from "$lib/domain/types";
import {
  getCachedNbaAllTeams,
  getCachedTeams,
  getStaleNbaAllTeams,
  hasStaleNbaCache,
  setCachedNbaAllTeams,
  setCachedTeams,
} from "$lib/services/team-cache";
import { fetchAllNbaTeams, searchTeams } from "$lib/services/team-search";

// ──────────────────────────────────────────────────
// Query Hooks
// ──────────────────────────────────────────────────

/** Create a TanStack Query hook for team search with cache-first strategy. */
export const createTeamSearchQuery = (
  getSportType: () => TournamentType,
  getQuery: () => string
) =>
  createQuery(() => {
    const sportType = getSportType();
    const query = getQuery();
    return {
      enabled: query.trim().length >= 3,
      queryFn: async (): Promise<GenericTeam[]> => {
        const cached = getCachedTeams(sportType, query);
        if (cached) {
          return cached;
        }
        const teams = await searchTeams(sportType, query);
        if (teams.length > 0) {
          setCachedTeams(sportType, query, teams);
        }
        return teams;
      },
      queryKey: ["teams", "search", sportType, query],
    };
  });

/** Create a TanStack Query hook for fetching all NBA teams. */
export const createNbaAllTeamsQuery = () => {
  return createQuery(() => ({
    queryFn: async (): Promise<GenericTeam[]> => {
      // Check cache first
      const cached = getCachedNbaAllTeams();
      if (cached) {
        return cached;
      }

      try {
        const teams = await fetchAllNbaTeams();
        setCachedNbaAllTeams(teams);
        return teams;
      } catch (error) {
        // Fallback to stale cache if API fails
        if (hasStaleNbaCache()) {
          return getStaleNbaAllTeams() ?? [];
        }
        throw error;
      }
    },
    queryKey: ["teams", "nba", "all"],
    staleTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  }));
};
