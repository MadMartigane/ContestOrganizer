import { MatchStatus } from "../../modules/matchs/matchs.js";
/**
 * Pure function to calculate the target match index for auto-scrolling.
 * Priority: DOING > DONE > null
 */
export function calculateTargetMatchIndex(tournament) {
  if (!tournament?.matchs || tournament.matchs.length === 0) {
    return null;
  }
  // Priority 1: Find LAST match in progress (DOING)
  const lastDoingIndex = tournament.matchs.findLastIndex(
    (match) => match.status === MatchStatus.DOING
  );
  if (lastDoingIndex !== -1) {
    return lastDoingIndex;
  }
  // Priority 2: Find LAST match played (DONE)
  const lastDoneIndex = tournament.matchs.findLastIndex(
    (match) => match.status === MatchStatus.DONE
  );
  return lastDoneIndex === -1 ? null : lastDoneIndex;
}
