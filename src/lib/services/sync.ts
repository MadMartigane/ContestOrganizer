import { BACKEND_TIMEOUT_MS } from "$lib/domain/constants";
import type { TournamentCollection } from "$lib/domain/types";
import { fetchBackendCollection } from "$lib/services/backend-api";
import { mergeCollections } from "$lib/services/merge";
import { loadCollection, saveCollection } from "$lib/services/storage";

let initialized = false;

/**
 * Create a promise that rejects after `ms` milliseconds.
 */
function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Backend sync timeout")), ms)
  );
}

/**
 * Initialize tournament sync.
 * 1. Load localStorage collection synchronously.
 * 2. Fetch backend collection with timeout.
 * 3. Merge both sources.
 * 4. Persist merged result via saveCollection (dual persistence).
 * 5. Return merged collection.
 *
 * Guards against double initialization.
 */
export async function initializeSync(): Promise<TournamentCollection> {
  if (initialized) {
    return loadCollection();
  }

  // 1. Load local (synchronous)
  const local = loadCollection();

  // 2. Load backend with timeout
  let backend: TournamentCollection | null = null;
  try {
    backend = await Promise.race([
      fetchBackendCollection(),
      timeout(BACKEND_TIMEOUT_MS),
    ]);
  } catch {
    console.warn("Backend sync timed out or failed — using local data.");
  }

  // 3. Merge
  const merged = mergeCollections(local, backend);

  // 4. Persist (saveCollection handles dual: localStorage + backend)
  saveCollection(merged);

  initialized = true;
  return merged;
}

/** Whether sync has completed. */
export function isSyncCompleted(): boolean {
  return initialized;
}
