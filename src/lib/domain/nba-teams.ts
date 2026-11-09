import { asset } from "$app/paths";
import type { GenericTeam, TournamentType } from "$lib/domain/types";

/**
 * Static list of all 30 NBA teams.
 * Source: Official NBA roster (as of 2024-25 season).
 *
 * ID scheme: 1–30 (synthetic, unique within NBA context).
 * These IDs are used for deduplication only — they do not map
 * to any external API.
 *
 * `logo` is the app-root path to the local crest SVG.
 * `<img src>` must use `resolveTeamLogo` so the path is passed through `asset`.
 */
export const NBA_LOGO_FILES: Readonly<Record<number, string>> = {
  1: "/nba-logos/bos.svg",
  2: "/nba-logos/bkn.svg",
  3: "/nba-logos/nyk.svg",
  4: "/nba-logos/phi.svg",
  5: "/nba-logos/tor.svg",
  6: "/nba-logos/chi.svg",
  7: "/nba-logos/cle.svg",
  8: "/nba-logos/det.svg",
  9: "/nba-logos/ind.svg",
  10: "/nba-logos/mil.svg",
  11: "/nba-logos/atl.svg",
  12: "/nba-logos/cha.svg",
  13: "/nba-logos/mia.svg",
  14: "/nba-logos/orl.svg",
  15: "/nba-logos/was.svg",
  16: "/nba-logos/den.svg",
  17: "/nba-logos/min.svg",
  18: "/nba-logos/okc.svg",
  19: "/nba-logos/por.svg",
  20: "/nba-logos/uta.svg",
  21: "/nba-logos/gsw.svg",
  22: "/nba-logos/lac.svg",
  23: "/nba-logos/lal.svg",
  24: "/nba-logos/phx.svg",
  25: "/nba-logos/sac.svg",
  26: "/nba-logos/dal.svg",
  27: "/nba-logos/hou.svg",
  28: "/nba-logos/mem.svg",
  29: "/nba-logos/nop.svg",
  30: "/nba-logos/sas.svg",
};

export const NBA_TEAMS: GenericTeam[] = [
  // Atlantic Division
  {
    id: 1,
    name: "Boston Celtics",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[1],
  },
  {
    id: 2,
    name: "Brooklyn Nets",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[2],
  },
  {
    id: 3,
    name: "New York Knicks",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[3],
  },
  {
    id: 4,
    name: "Philadelphia 76ers",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[4],
  },
  {
    id: 5,
    name: "Toronto Raptors",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[5],
  },
  // Central Division
  {
    id: 6,
    name: "Chicago Bulls",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[6],
  },
  {
    id: 7,
    name: "Cleveland Cavaliers",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[7],
  },
  {
    id: 8,
    name: "Detroit Pistons",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[8],
  },
  {
    id: 9,
    name: "Indiana Pacers",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[9],
  },
  {
    id: 10,
    name: "Milwaukee Bucks",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[10],
  },
  // Southeast Division
  {
    id: 11,
    name: "Atlanta Hawks",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[11],
  },
  {
    id: 12,
    name: "Charlotte Hornets",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[12],
  },
  {
    id: 13,
    name: "Miami Heat",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[13],
  },
  {
    id: 14,
    name: "Orlando Magic",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[14],
  },
  {
    id: 15,
    name: "Washington Wizards",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[15],
  },
  // Northwest Division
  {
    id: 16,
    name: "Denver Nuggets",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[16],
  },
  {
    id: 17,
    name: "Minnesota Timberwolves",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[17],
  },
  {
    id: 18,
    name: "Oklahoma City Thunder",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[18],
  },
  {
    id: 19,
    name: "Portland Trail Blazers",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[19],
  },
  {
    id: 20,
    name: "Utah Jazz",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[20],
  },
  // Pacific Division
  {
    id: 21,
    name: "Golden State Warriors",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[21],
  },
  {
    id: 22,
    name: "Los Angeles Clippers",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[22],
  },
  {
    id: 23,
    name: "Los Angeles Lakers",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[23],
  },
  {
    id: 24,
    name: "Phoenix Suns",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[24],
  },
  {
    id: 25,
    name: "Sacramento Kings",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[25],
  },
  // Southwest Division
  {
    id: 26,
    name: "Dallas Mavericks",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[26],
  },
  {
    id: 27,
    name: "Houston Rockets",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[27],
  },
  {
    id: 28,
    name: "Memphis Grizzlies",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[28],
  },
  {
    id: 29,
    name: "New Orleans Pelicans",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[29],
  },
  {
    id: 30,
    name: "San Antonio Spurs",
    type: "NBA" as TournamentType,
    logo: NBA_LOGO_FILES[30],
  },
];

/**
 * Resolve a displayable logo URL for a team.
 * NBA teams with a known local crest use `asset` on that path and ignore `team.logo`.
 * All other teams return `team.logo` unchanged (including `undefined`).
 */
export function resolveTeamLogo(
  team: Pick<GenericTeam, "id" | "type" | "logo">
): string | undefined {
  if (team.type === "NBA") {
    const localPath = NBA_LOGO_FILES[team.id];
    if (typeof localPath === "string") {
      return asset(localPath);
    }
  }
  return team.logo;
}
