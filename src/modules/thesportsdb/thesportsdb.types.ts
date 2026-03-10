import type { TournamentType } from "../tournaments/tournaments.types";

// Raw API response from TheSportsDB
export interface TheSportsDbApiTeam {
  idTeam: string;
  strBadge: string; // Logo URL
  strLogo?: string; // Alternative logo
  strTeam: string;
}

export interface TheSportsDbApiResponse {
  teams: TheSportsDbApiTeam[];
}

// Our internal NBA team type (compatible with GenericTeam)
export interface NbaTeam {
  id: number;
  logo: string; // URL with /small suffix
  name: string;
  type: (typeof TournamentType)["NBA"];
}

// Cache structure for localStorage
export interface TheSportsDbNbaCache {
  lastUpdated: number; // Unix timestamp
  teams: NbaTeam[];
  version: number;
}
