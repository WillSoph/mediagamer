export function formatScore(score: number | null) {
  if (score === null || Number.isNaN(score)) {
    return "--";
  }

  return String(Math.round(score));
}