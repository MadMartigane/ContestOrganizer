import type { GenericTeam, TournamentType } from "$lib/domain/types";

/**
 * Static list of all 30 NBA teams.
 * Source: Official NBA roster (as of 2024-25 season).
 *
 * ID scheme: 1–30 (synthetic, unique within NBA context).
 * These IDs are used for deduplication only — they do not map
 * to any external API.
 */
export const NBA_TEAMS: GenericTeam[] = [
  // Atlantic Division
  { id: 1, name: "Boston Celtics", type: "NBA" as TournamentType },
  { id: 2, name: "Brooklyn Nets", type: "NBA" as TournamentType },
  { id: 3, name: "New York Knicks", type: "NBA" as TournamentType },
  { id: 4, name: "Philadelphia 76ers", type: "NBA" as TournamentType },
  { id: 5, name: "Toronto Raptors", type: "NBA" as TournamentType },
  // Central Division
  { id: 6, name: "Chicago Bulls", type: "NBA" as TournamentType },
  { id: 7, name: "Cleveland Cavaliers", type: "NBA" as TournamentType },
  { id: 8, name: "Detroit Pistons", type: "NBA" as TournamentType },
  { id: 9, name: "Indiana Pacers", type: "NBA" as TournamentType },
  { id: 10, name: "Milwaukee Bucks", type: "NBA" as TournamentType },
  // Southeast Division
  { id: 11, name: "Atlanta Hawks", type: "NBA" as TournamentType },
  { id: 12, name: "Charlotte Hornets", type: "NBA" as TournamentType },
  { id: 13, name: "Miami Heat", type: "NBA" as TournamentType },
  { id: 14, name: "Orlando Magic", type: "NBA" as TournamentType },
  { id: 15, name: "Washington Wizards", type: "NBA" as TournamentType },
  // Northwest Division
  { id: 16, name: "Denver Nuggets", type: "NBA" as TournamentType },
  { id: 17, name: "Minnesota Timberwolves", type: "NBA" as TournamentType },
  { id: 18, name: "Oklahoma City Thunder", type: "NBA" as TournamentType },
  { id: 19, name: "Portland Trail Blazers", type: "NBA" as TournamentType },
  { id: 20, name: "Utah Jazz", type: "NBA" as TournamentType },
  // Pacific Division
  { id: 21, name: "Golden State Warriors", type: "NBA" as TournamentType },
  { id: 22, name: "Los Angeles Clippers", type: "NBA" as TournamentType },
  { id: 23, name: "Los Angeles Lakers", type: "NBA" as TournamentType },
  { id: 24, name: "Phoenix Suns", type: "NBA" as TournamentType },
  { id: 25, name: "Sacramento Kings", type: "NBA" as TournamentType },
  // Southwest Division
  { id: 26, name: "Dallas Mavericks", type: "NBA" as TournamentType },
  { id: 27, name: "Houston Rockets", type: "NBA" as TournamentType },
  { id: 28, name: "Memphis Grizzlies", type: "NBA" as TournamentType },
  { id: 29, name: "New Orleans Pelicans", type: "NBA" as TournamentType },
  { id: 30, name: "San Antonio Spurs", type: "NBA" as TournamentType },
];
