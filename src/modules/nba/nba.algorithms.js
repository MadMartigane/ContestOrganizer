import { generateNBAScheduleMinimax } from "./nba.scheduler";
export const algorithms = {
  minimax: {
    name: "minimax",
    fn: generateNBAScheduleMinimax,
    description:
      "Greedy rest-based algorithm selecting team with most remaining games",
  },
};
export function runWithAlgorithm(algorithmName, tournament, config) {
  const algorithm = algorithms[algorithmName];
  if (!algorithm) {
    throw new Error(`Unknown algorithm: ${algorithmName}`);
  }
  return algorithm.fn(tournament, config);
}
export function getAvailableAlgorithms() {
  return Object.keys(algorithms);
}
export function getAlgorithmInfo(name) {
  const algorithm = algorithms[name];
  if (!algorithm) {
    throw new Error(`Unknown algorithm: ${name}`);
  }
  return algorithm;
}
