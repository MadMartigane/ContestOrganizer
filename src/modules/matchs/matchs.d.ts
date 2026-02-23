import TeamRow from "../team-row/team-row";

export interface Row {
  doneMatchs?: number;
  scheduledMatchs?: number;
  selected: boolean;
  team: TeamRow;
  totalMatchs?: number;
}
