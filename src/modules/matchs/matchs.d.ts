import TeamRow from '../team-row/team-row';

export const enum MatchTeamType {
  HOST = 'Host',
  VISITOR = 'Visitor',
}

export const enum MatchStatus {
  PENDING = 'Pending',
  DOING = 'Doing',
  DONE = 'Done',
}

export type Row = {
  selected: boolean;
  team: TeamRow;
  totalMatchs?: number;
  doneMatchs?: number;
  scheduledMatchs?: number;
};
