import type { GenericTeam } from "../team-row/team-row.d";

export interface GridConfConstants {
  concededGoalsMin: number;
  inputDebounce: number;
  pointMin: number;
  scoredGoalsMin: number;
  teamNumberDefault: number;
  teamNumberMax: number;
  teamNumberMin: number;
  teamNumberStep: number;
}

export interface GridTeamOnUpdateDetail {
  genericTeam: GenericTeam;
  tournamentGridId: number | null;
}
