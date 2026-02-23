import { GenericTeam } from "../team-row/team-row.d";

export interface FutDBPagination {
  countCurrent: number;
  countTotal: number;
  itemsPerPage: number;
  pageCurrent: number;
  pageTotal: number;
}

export interface FutDBTeamReturn {
  items: GenericTeam[];
  pagination: FutDBPagination;
}

export interface FutDBLoadedImgBuffer {
  id: number;
  src: string;
}
