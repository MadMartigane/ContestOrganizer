import type { Tournament } from "../tournaments/tournaments.types";
import { generateNBAScheduleMinimax } from "./nba.scheduler";
import type { NBAScheduleConfig, NBAScheduleResult } from "./nba.types";

export type AlgorithmName = "minimax";

export interface Algorithm {
  description: string;
  fn: (tournament: Tournament, config?: NBAScheduleConfig) => NBAScheduleResult;
  name: AlgorithmName;
}

export const algorithms: Record<AlgorithmName, Algorithm> = {
  minimax: {
    name: "minimax",
    fn: generateNBAScheduleMinimax,
    description:
      "Greedy rest-based algorithm selecting team with most remaining games",
  },
};

export function runWithAlgorithm(
  algorithmName: AlgorithmName,
  tournament: Tournament,
  config?: NBAScheduleConfig
): NBAScheduleResult {
  const algorithm = algorithms[algorithmName];
  if (!algorithm) {
    throw new Error(`Unknown algorithm: ${algorithmName}`);
  }
  return algorithm.fn(tournament, config);
}

export function getAvailableAlgorithms(): AlgorithmName[] {
  return Object.keys(algorithms) as AlgorithmName[];
}

export function getAlgorithmInfo(name: AlgorithmName): Algorithm {
  const algorithm = algorithms[name];
  if (!algorithm) {
    throw new Error(`Unknown algorithm: ${name}`);
  }
  return algorithm;
}
