import type { MatchStatus, TournamentType } from "./types";

// ──────────────────────────────────────────────────
// Sport Configuration
// ──────────────────────────────────────────────────

export interface SportConfig {
  emoji: string;
  gridModel: "default" | "basket";
  label: string;
  scorerType: "common" | "basket" | "rugby";
  type: TournamentType;
}

/** Sport configuration indexed by TournamentType */
export const SPORT_CONFIG: Record<TournamentType, SportConfig> = {
  Foot: {
    type: "Foot",
    emoji: "⚽",
    label: "Foot",
    gridModel: "default",
    scorerType: "common",
  },
  Basket: {
    type: "Basket",
    emoji: "🏀",
    label: "Basket",
    gridModel: "basket",
    scorerType: "basket",
  },
  NBA: {
    type: "NBA",
    emoji: "🏀",
    label: "NBA",
    gridModel: "basket",
    scorerType: "basket",
  },
  NFL: {
    type: "NFL",
    emoji: "🏈",
    label: "NFL",
    gridModel: "basket",
    scorerType: "rugby",
  },
  Rugby: {
    type: "Rugby",
    emoji: "🏉",
    label: "Rugby",
    gridModel: "basket",
    scorerType: "rugby",
  },
};

/** Ordered list of sport types for selector UI */
export const SPORT_OPTIONS: TournamentType[] = [
  "NBA",
  "Rugby",
  "NFL",
  "Basket",
  "Foot",
];

/** Default sport type */
export const DEFAULT_SPORT: TournamentType = "Foot";

// ──────────────────────────────────────────────────
// Match Status Configuration
// ──────────────────────────────────────────────────

export interface MatchStatusConfig {
  color: "primary" | "success" | "warning";
  labelKey: string;
  status: MatchStatus;
}

export const MATCH_STATUS_CONFIG: Record<MatchStatus, MatchStatusConfig> = {
  PENDING: {
    status: "PENDING",
    labelKey: "match_status_pending",
    color: "primary",
  },
  DOING: {
    status: "DOING",
    labelKey: "match_status_doing",
    color: "success",
  },
  DONE: {
    status: "DONE",
    labelKey: "match_status_done",
    color: "warning",
  },
};

// ──────────────────────────────────────────────────
// Grid Constraints
// ──────────────────────────────────────────────────

export const GRID_MIN_TEAMS = 2;
export const GRID_MAX_TEAMS = 32;
export const GRID_STEP = 2;
export const GRID_DEFAULT_TEAMS = 4;

// ──────────────────────────────────────────────────
// NBA Constants
// ──────────────────────────────────────────────────

export const NBA_MAX_GAMES_PER_TEAM = 82;
export const NBA_MIN_TEAMS = 2;
export const NBA_HOME_AWAY_BALANCE = 41;

// ──────────────────────────────────────────────────
// Point System (universal — all sports)
// ──────────────────────────────────────────────────

export const POINTS_WIN = 3;
export const POINTS_DRAW = 1;
export const POINTS_LOSS = 0;

/** Point systems per scorer type */
export const POINT_SYSTEMS = {
  common: { win: POINTS_WIN, draw: POINTS_DRAW, loss: POINTS_LOSS },
  basket: { win: POINTS_WIN, draw: POINTS_DRAW, loss: POINTS_LOSS },
  rugby: { win: POINTS_WIN, draw: POINTS_DRAW, loss: POINTS_LOSS },
} as const;

export type ScorerType = keyof typeof POINT_SYSTEMS;

// ──────────────────────────────────────────────────
// localStorage Keys
// ──────────────────────────────────────────────────

export const STORAGE_KEY_TOURNAMENTS = "CONTEST_ORGANIZER_TOURNAMENTS";
export const STORAGE_KEY_SETTINGS = "CONTEST_ORGANIZER_SETTING";

// ──────────────────────────────────────────────────
// Backend API Paths
// ──────────────────────────────────────────────────

export const BACKEND_LOAD_PATH = "/api/index.php/list/tournaments";
export const BACKEND_STORE_PATH = "/api/index.php/store/tournaments";
export const BACKEND_TIMEOUT_MS = 5000;
