import { TournamentType } from "../tournaments/tournaments.types";

export interface GenericTeamCountry {
  code: string;
  flag: string;
  id: number;
  name: string;
}

export interface GenericTeam {
  country?: GenericTeamCountry;
  id: number;
  league?: number;
  logo?: string;
  name: string;
  type: TournamentType;
}

export interface TeamRowProperties {
  concededGoals: number;
  goalAverage: number;
  id: number;
  points: number;
  scoredGoals: number;
  team?: GenericTeam;
  type: TournamentType;
}

export interface GenericTeamLogo {
  base64?: string;
  url?: string;
}
