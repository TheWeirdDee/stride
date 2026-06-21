import { describe, it, expect } from 'vitest'
import { getDistance, getPathDistance } from '../haversine'

describe('getDistance', () => {
  it('is ~0 for identical points', () => {
    const p = { latitude: 6.5244, longitude: 3.3792 }
    expect(getDistance(p, p)).toBeCloseTo(0, 6)
  })

  it('matches a known distance (~1.11 km per 0.01° of latitude)', () => {
    const a = { latitude: 0, longitude: 0 }
    const b = { latitude: 0.01, longitude: 0 }
    const km = getDistance(a, b)
    expect(km).toBeGreaterThan(1.1)
    expect(km).toBeLessThan(1.12)
  })

  it('is symmetric', () => {
    const a = { latitude: 6.5, longitude: 3.3 }
    const b = { latitude: 6.6, longitude: 3.4 }
    expect(getDistance(a, b)).toBeCloseTo(getDistance(b, a), 9)
  })
})

describe('getPathDistance', () => {
  it('is 0 for empty or single-point paths', () => {
    expect(getPathDistance([])).toBe(0)
    expect(getPathDistance([{ latitude: 1, longitude: 1 }])).toBe(0)
  })

  it('sums the legs of a path', () => {
    const path = [
      { latitude: 0, longitude: 0 },
      { latitude: 0.01, longitude: 0 },
      { latitude: 0.02, longitude: 0 },
    ]
    const total = getPathDistance(path)
    const leg = getDistance(path[0], path[1])
    expect(total).toBeCloseTo(leg * 2, 6)
  })
})
