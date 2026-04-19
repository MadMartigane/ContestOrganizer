// ──────────────────────────────────────────────────
// Tournament Types
// ──────────────────────────────────────────────────

/** The 5 supported sport types */
export type TournamentType = "Foot" | "Basket" | "NBA" | "NFL" | "Rugby";

/** Match lifecycle statuses */
export type MatchStatus = "PENDING" | "DOING" | "DONE";

// ──────────────────────────────────────────────────
// Domain Models
// ──────────────────────────────────────────────────

/** Country data attached to a team (optional, from external APIs) */
export interface TeamCountry {
  code: string;
  flag: string;
  id: number;
  name: string;
}

/** Generic team representation from external APIs */
export interface GenericTeam {
  country?: TeamCountry;
  id: number;
  league?: number;
  logo?: string;
  name: string;
  type: TournamentType;
}

/** Grid slot — one row in the tournament grid */
export interface TeamRow {
  concededGoals: number;
  goalAverage: number;
  id: string;
  points: number;
  scheduledMatchs: number;
  scoredGoals: number;
  team: GenericTeam | undefined;
  type: TournamentType;
}

/** Match goals/scores */
export interface MatchGoals {
  host: number;
  visitor: number;
}

/** A single match between two teams */
export interface Match {
  goals: MatchGoals;
  hostId: string;
  id: string;
  status: MatchStatus;
  visitorId: string;
}

/** Tournament aggregate root */
export interface Tournament {
  grid: TeamRow[];
  id: string;
  matchs: Match[];
  name: string;
  timestamp: number;
  type: TournamentType;
}

// ──────────────────────────────────────────────────
// Persistence Shapes
// ──────────────────────────────────────────────────

/** Shape stored in localStorage under CONTEST_ORGANIZER_TOURNAMENTS */
export interface TournamentCollection {
  timestamp: number;
  tournaments: Tournament[];
}

/** Shape stored in localStorage under CONTEST_ORGANIZER_SETTING */
export interface AppSettings {
  darkMode?: boolean;
  locale?: string;
}

// ──────────────────────────────────────────────────
// Breadcrumb
// ──────────────────────────────────────────────────

export interface BreadcrumbItem {
  emoji: string;
  href?: string;
  label: string;
}
