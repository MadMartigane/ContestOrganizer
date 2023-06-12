
// TODO 
export interface ApiSportsReturnError {
  status: number,
  message: string
}

export type ApiSportsContry = {
  id: number,
  name: string,
  flag: string,
  code: string
}

export type ApiSportsTeam = {
  id: number,
  name: string,
  nationnal: boolean,
  logo: string,
  country: ApiSportsContry
}

export type ApiSportsTeamReturn = {
  errors: ApiSportsReturnError[],
  get: string,
  results: number,
  response: ApiSportsTeam[]
}

export type ApiSportsSearchCache = {
  search: string,
  results: number[]
}

export type ApiSportsCache = {
  allTeams: ApiSportsTeam[],
  allSearch: ApiSportsSearchCache[]
}