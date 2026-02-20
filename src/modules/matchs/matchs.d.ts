import TeamRow from "../team-row/team-row";



export type Row = {
  selected: boolean;
  team: TeamRow;
  totalMatchs?: number;
  doneMatchs?: number;
  scheduledMatchs?: number;
};
