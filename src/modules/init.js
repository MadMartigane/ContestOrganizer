/**
 * MIGRATION NOTE:
 * This module is a TEMPORARY bridge during the Stencil → Vanilla migration.
 *
 * PROBLEM: Before this fix, both the Stencil bundle (app.esm.js) and the Vanilla
 * bundle (vanilla-entry.ts) imported from `tournaments.ts`. Each bundle created
 * its own module-level singleton instance at load time, resulting in two completely
 * separate Tournaments objects with independent state.
 *
 * - Stencil components (page-tournament-select.tsx, etc.) wrote to Instance A
 * - Vanilla components (page-match.ts, match-tile.ts, etc.) read from Instance B
 * - Data written in A was never visible in B → "Tournois non trouvé" errors
 *
 * SOLUTION: We use window.__tournaments as a shared global reference.
 * - The Stencil bundle's global script (app.ts) initializes the singleton first
 * - getTournaments() attaches it to window if not already present
 * - Both bundles then read from the same window reference
 *
 * REMOVAL CONDITION: When migration completes and ALL components are vanilla,
 * this module can be replaced with a simple:
 *   import tournaments from './tournaments/tournaments';
 *   export default tournaments;
 *
 * This module solves the dual-bundle singleton isolation problem by using the
 * browser's window object as a shared bridge. Both bundles share the same
 * runtime environment, so window acts as a common ground for instance sharing.
 */
// biome-ignore lint: Tournaments is used locally and re-exported to maintain API compatibility
import { Tournaments } from "./tournaments/tournaments";

const WINDOW_KEY = "__tournaments";
/**
 * Returns the shared Tournaments singleton instance.
 *
 * Uses window as the bridge between Stencil and Vanilla bundles to ensure
 * both bundles reference the same instance.
 *
 * @returns The global Tournaments singleton
 */
export function getTournaments() {
  if (!window[WINDOW_KEY]) {
    window[WINDOW_KEY] = new Tournaments();
  }
  return window[WINDOW_KEY];
}
// Re-export Tournaments class for type access
export { Tournaments };
