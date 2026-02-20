import { TournamentType } from "../tournaments/tournaments.types";

export type GenericTeamCountry = {
  id: number;
  name: string;
  flag: string;
  code: string;
};

export type GenericTeam = {
  id: number;
  name: string;
  type: TournamentType;
  league?: number;
  logo?: string;
  country?: GenericTeamCountry;
};

export interface TeamRowProperties {
  concededGoals: number;
  goalAverage: number;
  id: number;
  points: number;
  scoredGoals: number;
  team?: GenericTeam;
  type: TournamentType;
}

export type GenericTeamLogo = {
  url?: string;
  base64?: string;
};
