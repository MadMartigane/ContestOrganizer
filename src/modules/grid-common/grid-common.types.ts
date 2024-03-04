import { GenericTeam } from '../team-row/team-row.d';

export interface GridConfConstants {
  teamNumberMax: number;
  teamNumberMin: number;
  teamNumberDefault: number;
  scoredGoalsMin: number;
  concededGoalsMin: number;
  teamNumberStep: number;
  pointMin: number;
  inputDebounce: number;
}

export type GridTeamOnUpdateDetail = {
  genericTeam: GenericTeam;
  tournamentGridId: number | null;
};
