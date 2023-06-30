import { GenericTeam } from "../team-row/team-row.d"
import { TournamentType } from "../tournaments/tournaments.d"

export interface ApiSportsReturnError {
  status: number,
  message: string
}

export type ApiSportsTeamReturn = {
  errors: ApiSportsReturnError[],
  get: string,
  results: number,
  response: GenericTeam[]
}

export type ApiSportsSearchCache = {
  search: string,
  type: TournamentType,
  results: number[]
}

export type ApiSportsCache = {
  allTeams: GenericTeam[],
  allSearch: ApiSportsSearchCache[]
}