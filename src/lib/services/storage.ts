import { DEFAULT_SPORT, STORAGE_KEY_TOURNAMENTS } from "$lib/domain/constants";
import { generateId } from "$lib/domain/id";
import type {
  Tournament,
  TournamentCollection,
  TournamentType,
} from "$lib/domain/types";
import { saveToBackend } from "$lib/services/backend-api";

// ──────────────────────────────────────────────────
// Internal Helpers
// ──────────────────────────────────────────────────

const createEmptyCollection = (): TournamentCollection => ({
  timestamp: Date.now(),
  tournaments: [],
});

const isLocalStorageAvailable = (): boolean => {
  try {
    const key = "__storage_test__";
    localStorage.setItem(key, "test");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

// ──────────────────────────────────────────────────
// Collection-Level Operations
// ──────────────────────────────────────────────────

/**
 * Load the full tournament collection from localStorage.
 * Returns empty collection if unavailable or corrupted.
 */
export const loadCollection = (): TournamentCollection => {
  if (!isLocalStorageAvailable()) {
    return createEmptyCollection();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_TOURNAMENTS);
    if (!raw) {
      return createEmptyCollection();
    }

    const parsed = JSON.parse(raw);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      Array.isArray(parsed.tournaments) &&
      typeof parsed.timestamp === "number"
    ) {
      return parsed as TournamentCollection;
    }

    console.warn("Corrupted tournament data in localStorage — resetting.");
    return createEmptyCollection();
  } catch {
    console.warn("Failed to parse tournament data — resetting.");
    return createEmptyCollection();
  }
};

/**
 * Save the full tournament collection to localStorage.
 * Updates timestamp automatically.
 */
export const saveCollection = (collection: TournamentCollection): boolean => {
  collection.timestamp = Date.now();

  // Fire-and-forget backend save (independent of localStorage result)
  saveToBackend(collection);

  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEY_TOURNAMENTS, JSON.stringify(collection));
    return true;
  } catch {
    console.warn("Failed to save tournament data to localStorage.");
    return false;
  }
};

// ──────────────────────────────────────────────────
// Tournament CRUD
// ──────────────────────────────────────────────────

/** Get all tournaments */
export const getAllTournaments = (): Tournament[] =>
  loadCollection().tournaments;

/** Get a single tournament by ID */
export const getTournamentById = (id: string): Tournament | undefined =>
  loadCollection().tournaments.find((t) => t.id === id);

/** Create a new tournament with empty grid and matches */
export const createTournament = (
  name: string,
  type: TournamentType = DEFAULT_SPORT
): Tournament => {
  const collection = loadCollection();

  const tournament: Tournament = {
    id: generateId(),
    name: name.trim(),
    type,
    grid: [],
    matchs: [],
    timestamp: Date.now(),
  };

  collection.tournaments.push(tournament);
  saveCollection(collection);

  return tournament;
};

/** Update an existing tournament (by ID). Returns the updated tournament or undefined. */
export const updateTournament = (
  id: string,
  updater: (t: Tournament) => Tournament
): Tournament | undefined => {
  const collection = loadCollection();
  const index = collection.tournaments.findIndex((t) => t.id === id);
  if (index === -1) {
    return;
  }

  collection.tournaments[index] = updater(collection.tournaments[index]);
  collection.tournaments[index].timestamp = Date.now();
  saveCollection(collection);

  return collection.tournaments[index];
};

/** Delete a tournament by ID. Returns true if deleted. */
export const deleteTournament = (id: string): boolean => {
  const collection = loadCollection();
  const initialLength = collection.tournaments.length;
  collection.tournaments = collection.tournaments.filter((t) => t.id !== id);

  if (collection.tournaments.length === initialLength) {
    return false;
  }

  saveCollection(collection);
  return true;
};
