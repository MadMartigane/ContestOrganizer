
import { GenericTeam } from "../team-row/team-row.d";

export interface FutDBPagination {
  countCurrent: number,
  countTotal: number,
  pageCurrent: number,
  pageTotal: number,
  itemsPerPage: number
}

export interface FutDBTeamReturn {
  pagination: FutDBPagination,
  items: Array<GenericTeam>
}

export interface FutDBLoadedImgBuffer {
  id: number,
  src: string
}

