// Pure fitness helpers (no DOM/web APIs) so they're easy to unit-test and reuse.

export const STEP_LENGTH_M = 0.75 // average walking stride

/** Estimate step count from a distance in metres. */
export function estimateSteps(meters: number): number {
  if (!Number.isFinite(meters) || meters <= 0) return 0
  return Math.round(meters / STEP_LENGTH_M)
}

/** Pace in minutes per km. Returns 0 for negligible/zero distance. */
export function paceMinPerKm(meters: number, seconds: number): number {
  const km = meters / 1000
  if (km <= 0.05 || seconds <= 0) return 0
  return seconds / 60 / km
}

/** Format a min/km pace number as "m:ss". */
export function formatPace(minPerKm: number): string {
  if (minPerKm <= 0) return '—:—'
  const m = Math.floor(minPerKm)
  const s = Math.round((minPerKm - m) * 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
