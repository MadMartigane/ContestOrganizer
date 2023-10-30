import { TournamentType } from "../tournaments/tournaments.types"

export type GenericTeamCountry = {
  id: number,
  name: string,
  flag: string,
  code: string
}

export type GenericTeam = {
  id: number,
  name: string,
  type: TournamentType,
  league?: number,
  logo?: string,
  country?: GenericTeamCountry
}

export interface TeamRowProperties {
  id: number;
  team?: GenericTeam;
  type: TournamentType;
  points: number;
  concededGoals: number;
  scoredGoals: number;
  goalAverage: number;
}

