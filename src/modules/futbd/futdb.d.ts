
export interface FutDBPagination {
  countCurrent: number,
  countTotal: number,
  pageCurrent: number,
  pageTotal: number,
  itemsPerPage: number
}

export interface FutDBTeam {
  id: number,
  name: string,
  league: number
}

export interface FutDBTeamReturn {
  pagination: FutDBPagination,
  items: Array<FutDBTeam>
}

export interface FutDBLoadedImgBuffer {
  id: number,
  src: string
}

