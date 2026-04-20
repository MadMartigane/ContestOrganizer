import { BACKEND_LOAD_PATH, BACKEND_STORE_PATH } from "$lib/domain/constants";
import type { BackendResponse, TournamentCollection } from "$lib/domain/types";

// ──────────────────────────────────────────────────
// Response Parsing
// ──────────────────────────────────────────────────

/**
 * Parse a Backend Procedure Pattern response.
 * Returns the `data` field if procedure === "OK" and data has a valid
 * TournamentCollection shape. Returns null otherwise.
 */
function parseCollectionResponse(raw: unknown): TournamentCollection | null {
  if (typeof raw !== "object" || raw === null) {
    console.warn("Backend: invalid response — not an object.");
    return null;
  }

  const resp = raw as BackendResponse<TournamentCollection>;

  if (resp.procedure !== "OK") {
    console.warn(`Backend error: ${resp.error ?? "Unknown"}`);
    return null;
  }

  const data = resp.data;
  if (
    typeof data === "object" &&
    data !== null &&
    Array.isArray(data.tournaments) &&
    typeof data.timestamp === "number"
  ) {
    return data as TournamentCollection;
  }

  console.warn("Backend: response data is not a valid TournamentCollection.");
  return null;
}

// ──────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────

/**
 * Fetch the tournament collection from the backend.
 * Returns null on any failure (network, parse, procedure error).
 */
export async function fetchBackendCollection(): Promise<TournamentCollection | null> {
  try {
    const response = await fetch(BACKEND_LOAD_PATH);
    if (!response.ok) {
      console.warn(`Backend load failed: HTTP ${response.status}`);
      return null;
    }
    const raw = await response.json();
    return parseCollectionResponse(raw);
  } catch (error) {
    console.warn(
      `Backend load failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return null;
  }
}

/**
 * Save the tournament collection to the backend.
 * Fire-and-forget: returns void immediately, logs errors to console.
 * Does NOT block or throw.
 */
export function saveToBackend(collection: TournamentCollection): void {
  fetch(BACKEND_STORE_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(collection),
  })
    .then(async (response) => {
      if (!response.ok) {
        console.warn(`Backend save failed: HTTP ${response.status}`);
        return;
      }
      try {
        const raw = await response.json();
        if (
          typeof raw === "object" &&
          raw !== null &&
          (raw as BackendResponse<unknown>).procedure !== "OK"
        ) {
          console.warn(
            `Backend save rejected: ${(raw as BackendResponse<unknown>).error ?? "Unknown"}`
          );
        }
      } catch {
        // Response not JSON — acceptable for fire-and-forget
      }
    })
    .catch((error) => {
      console.warn(
        `Backend save failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    });
}
