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
  {
    id: 1,
    name: "Boston Celtics",
    type: "NBA" as TournamentType,
    logo: "https://r2.thesportsdb.com/images/media/team/badge/4j85bn1667936589.png",
  },
  {
    id: 2,
    name: "Brooklyn Nets",
    type: "NBA" as TournamentType,
    logo: "https://r2.thesportsdb.com/images/media/team/badge/hkafe61739948361.png",
  },
  {
    id: 3,
    name: "New York Knicks",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/4k8obt1778226764.png",
  },
  {
    id: 4,
    name: "Philadelphia 76ers",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/j6rlbi1778226857.png",
  },
  {
    id: 5,
    name: "Toronto Raptors",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/lct96a1778227205.png",
  },
  // Central Division
  {
    id: 6,
    name: "Chicago Bulls",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/ehq8l31778197349.png",
  },
  {
    id: 7,
    name: "Cleveland Cavaliers",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/pch9ct1778195828.png",
  },
  {
    id: 8,
    name: "Detroit Pistons",
    type: "NBA" as TournamentType,
    logo: "https://r2.thesportsdb.com/images/media/team/badge/lg7qrc1621594751.png",
  },
  {
    id: 9,
    name: "Indiana Pacers",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/y3lutb1778226511.png",
  },
  {
    id: 10,
    name: "Milwaukee Bucks",
    type: "NBA" as TournamentType,
    logo: "https://r2.thesportsdb.com/images/media/team/badge/olhug01621594702.png",
  },
  // Southeast Division
  {
    id: 11,
    name: "Atlanta Hawks",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/7o1noy1778226315.png",
  },
  {
    id: 12,
    name: "Charlotte Hornets",
    type: "NBA" as TournamentType,
    logo: "https://r2.thesportsdb.com/images/media/team/badge/xqtvvp1422380623.png",
  },
  {
    id: 13,
    name: "Miami Heat",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/b9tye31778226616.png",
  },
  {
    id: 14,
    name: "Orlando Magic",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/j0mpu81778198371.png",
  },
  {
    id: 15,
    name: "Washington Wizards",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/dxac7a1778227278.png",
  },
  // Northwest Division
  {
    id: 16,
    name: "Denver Nuggets",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/s8ch7m1778197814.png",
  },
  {
    id: 17,
    name: "Minnesota Timberwolves",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/jkf7951778197850.png",
  },
  {
    id: 18,
    name: "Oklahoma City Thunder",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/bkhj5p1778199006.png",
  },
  {
    id: 19,
    name: "Portland Trail Blazers",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/umehtv1778226952.png",
  },
  {
    id: 20,
    name: "Utah Jazz",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/trct8w1778198868.png",
  },
  // Pacific Division
  {
    id: 21,
    name: "Golden State Warriors",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/xokycb1778197905.png",
  },
  {
    id: 22,
    name: "Los Angeles Clippers",
    type: "NBA" as TournamentType,
    logo: "https://r2.thesportsdb.com/images/media/team/badge/3gtb8s1719303125.png",
  },
  {
    id: 23,
    name: "Los Angeles Lakers",
    type: "NBA" as TournamentType,
    logo: "https://r2.thesportsdb.com/images/media/team/badge/d8uoxw1714254511.png",
  },
  {
    id: 24,
    name: "Phoenix Suns",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/xfyknc1778198971.png",
  },
  {
    id: 25,
    name: "Sacramento Kings",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/k2buwo1778227426.png",
  },
  // Southwest Division
  {
    id: 26,
    name: "Dallas Mavericks",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/s5dx7c1778197536.png",
  },
  {
    id: 27,
    name: "Houston Rockets",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/n736e31778227493.png",
  },
  {
    id: 28,
    name: "Memphis Grizzlies",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/v44qp21778197640.png",
  },
  {
    id: 29,
    name: "New Orleans Pelicans",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/xoxjsr1778226698.png",
  },
  {
    id: 30,
    name: "San Antonio Spurs",
    type: "NBA" as TournamentType,
    logo: "https://www.thesportsdb.com/images/media/team/badge/89mwqb1778227087.png",
  },
];
