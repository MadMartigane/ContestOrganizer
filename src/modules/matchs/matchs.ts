import { MatchStatus } from './matchs.d';
import uuid from '../uuid/uuid';

export * from './matchs.d';

export class Match {
  public readonly id: number;
  public hostId: number | null;
  public visitorId: number | null;
  public goals: { visitor: number; host: number };
  public status: MatchStatus;

  constructor(host = null, visitor = null, status = MatchStatus.PENDING) {
    this.id = uuid.new();
    this.hostId = host;
    this.visitorId = visitor;
    this.goals = { host: 0, visitor: 0 };
    this.status = status;
  }
}
