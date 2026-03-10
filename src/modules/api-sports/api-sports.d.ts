import { GenericTeam } from "../team-row/team-row.d";
import { TournamentType } from "../tournaments/tournaments.types";

export interface ApiSportsReturnError {
  message: string;
  status: number;
}

export interface ApiSportsTeamResponse {
  team: GenericTeam;
  venue?: {
    id: number;
    name: string;
    address?: string;
    city?: string;
    capacity?: number;
    surface?: string;
    image?: string;
  };
}

export interface ApiSportsTeamReturn {
  errors: ApiSportsReturnError[];
  get: string;
  response: ApiSportsTeamResponse[];
  results: number;
}

export interface ApiSportsSearchCache {
  results: number[];
  search: string;
  type: TournamentType;
}

export interface ApiSportsCache {
  allSearch: ApiSportsSearchCache[];
  allTeams: GenericTeam[];
}
