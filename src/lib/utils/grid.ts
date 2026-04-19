import {
  GRID_DEFAULT_TEAMS,
  GRID_MAX_TEAMS,
  GRID_MIN_TEAMS,
  GRID_STEP,
} from "$lib/domain/constants";
import { generateId } from "$lib/domain/id";
import type { TeamRow, TournamentType } from "$lib/domain/types";

// ──────────────────────────────────────────────────
// Grid Slot Factory
// ──────────────────────────────────────────────────

/**
 * Create a new empty grid slot (TeamRow).
 */
export const createEmptySlot = (type: TournamentType): TeamRow => ({
  id: generateId(),
  type,
  team: undefined,
  points: 0,
  scoredGoals: 0,
  concededGoals: 0,
  goalAverage: 0,
  scheduledMatchs: 0,
});

/**
 * Create a grid with N empty slots.
 */
export const createEmptyGrid = (
  count: number,
  type: TournamentType
): TeamRow[] => Array.from({ length: count }, () => createEmptySlot(type));

// ──────────────────────────────────────────────────
// Grid Resizing
// ──────────────────────────────────────────────────

/**
 * Clamp a team count to valid grid constraints.
 * Enforces: min 2, max 32, step 2.
 */
export const clampTeamCount = (count: number): number => {
  const clamped = Math.max(GRID_MIN_TEAMS, Math.min(GRID_MAX_TEAMS, count));
  return Math.floor(clamped / GRID_STEP) * GRID_STEP;
};

/**
 * Resize an existing grid to a new team count.
 *
 * - Increasing: New empty slots appended at the end.
 * - Decreasing: Slots beyond new count are removed.
 *   Remaining slots (index 0 to newCount - 1) preserve all data.
 */
export const resizeGrid = (
  currentGrid: TeamRow[],
  newCount: number,
  type: TournamentType
): TeamRow[] => {
  const target = clampTeamCount(newCount);
  const current = currentGrid.length;

  if (target === current) {
    return currentGrid;
  }

  if (target > current) {
    const newSlots = createEmptyGrid(target - current, type);
    return [...currentGrid, ...newSlots];
  }

  return currentGrid.slice(0, target);
};

// ──────────────────────────────────────────────────
// Grid Reset
// ──────────────────────────────────────────────────

/**
 * Reset a grid to its default state: GRID_DEFAULT_TEAMS empty slots.
 * All existing data is discarded.
 */
export const resetGrid = (type: TournamentType): TeamRow[] =>
  createEmptyGrid(GRID_DEFAULT_TEAMS, type);

/**
 * Validate a team count value.
 * Returns the clamped value and whether it was adjusted.
 */
export const validateTeamCount = (
  count: number
): { value: number; wasAdjusted: boolean } => {
  const clamped = clampTeamCount(count);
  return { value: clamped, wasAdjusted: clamped !== count };
};
