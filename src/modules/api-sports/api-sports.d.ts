import { GenericTeam } from "../team-row/team-row.d";
import { TournamentType } from "../tournaments/tournaments.types";

export interface ApiSportsReturnError {
  message: string;
  status: number;
}

export interface ApiSportsTeamReturn {
  errors: ApiSportsReturnError[];
  get: string;
  response: GenericTeam[];
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
