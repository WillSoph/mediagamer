export function formatScore(score: number | null) {
  if (score === null) return "--";

  return score >= Math.ceil(score) - 0.2
    ? Math.ceil(score)
    : Math.floor(score);
}