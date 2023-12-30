import TeamRow from '../team-row/team-row';
import { Match } from './tournaments';

export type Tournament = {
  id: number;
  name: string;
  grid: Array<TeamRow>;
  matchs: Array<Match>;
  type: TournamentType;
  timestamp?: number;
};

export const enum MatchTeamType {
  HOST = 'Host',
  VISITOR = 'Visitor',
}

export const enum MatchStatus {
  PENDING = 'Pending',
  DOING = 'Doing',
  DONE = 'Done',
}

export const enum TournamentType {
  FOOT = 'Foot',
  BASKET = 'Basket',
  NBA = 'NBA',
  NFL = 'NFL',
  RUGBY = 'Rugby',
}

export const enum TournamentTypeLabel {
  FOOT = '⚽ Foot',
  NBA = '🏀 NBA',
  BASKET = '🏀 Basket',
  NFL = '🏈 NFL',
  RUGBY = '🏉 Rugby',
}

export type TournamentUpdateEvent = {
  tournament: Tournament;
};
