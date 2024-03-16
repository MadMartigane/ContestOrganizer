import TeamRow from '../team-row/team-row';
import { Match } from '../matchs/matchs';

export type Tournament = {
  id: number;
  name: string;
  grid: Array<TeamRow>;
  matchs: Array<Match>;
  type: TournamentType;
  timestamp?: number;
};

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
  tournamentId: number;
};
