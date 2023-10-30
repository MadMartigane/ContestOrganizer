import { Tournament } from "../tournaments/tournaments.types";

export type ProcedureDataType = "OK" | "NOT_SUPPORTED" | "NOT_IMPLEMENTED" | "500" | "NOT_FOUND";

export type ProcedureError = {
    message: string;
}
export type ProcedureData = {
    procedure: ProcedureDataType;
    data: unknown;
    error: ProcedureError;
    debug: Array<string>;
}

export type ProcedureContentStoredTournaments = {
    timestamp: number;
    tournaments: Array<Tournament>;
}


