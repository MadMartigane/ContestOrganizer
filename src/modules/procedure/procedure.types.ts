import type { Tournament } from "../tournaments/tournaments.types";

export type ProcedureDataType =
  | "OK"
  | "NOT_SUPPORTED"
  | "NOT_IMPLEMENTED"
  | "500"
  | "NOT_FOUND";

export interface ProcedureError {
  message: string;
}
export interface ProcedureData {
  data: unknown;
  debug: string[];
  error: ProcedureError;
  procedure: ProcedureDataType;
}

export interface ProcedureContentStoredTournaments {
  timestamp: number;
  tournaments: Tournament[];
}
