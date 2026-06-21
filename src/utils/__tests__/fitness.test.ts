import { describe, it, expect } from 'vitest'
import { estimateSteps, paceMinPerKm, formatPace } from '../fitness'

describe('estimateSteps', () => {
  it('returns 0 for zero/negative/invalid distance', () => {
    expect(estimateSteps(0)).toBe(0)
    expect(estimateSteps(-5)).toBe(0)
    expect(estimateSteps(NaN)).toBe(0)
  })

  it('estimates ~1333 steps per km (0.75 m stride)', () => {
    expect(estimateSteps(1000)).toBe(1333)
    expect(estimateSteps(750)).toBe(1000)
  })
})

describe('paceMinPerKm', () => {
  it('returns 0 for negligible distance or no time', () => {
    expect(paceMinPerKm(10, 60)).toBe(0)
    expect(paceMinPerKm(1000, 0)).toBe(0)
  })

  it('computes 6 min/km for 1 km in 6 minutes', () => {
    expect(paceMinPerKm(1000, 360)).toBeCloseTo(6, 6)
  })
})

describe('formatPace', () => {
  it('formats minutes:seconds', () => {
    expect(formatPace(6)).toBe('6:00')
    expect(formatPace(5.5)).toBe('5:30')
  })

  it('shows a placeholder for zero', () => {
    expect(formatPace(0)).toBe('—:—')
  })
})
