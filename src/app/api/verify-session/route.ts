import { NextRequest, NextResponse } from 'next/server'
import { keccak256, encodePacked } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { randomBytes } from 'crypto'

 
const RULES = {
  walk: { maxSpeedKmh: 8, minMinutesPerKm: 7 },
  run: { maxSpeedKmh: 25, minMinutesPerKm: 3.5 },
  MAX_GAP_METERS: 200,
  MAX_PAUSE_COUNT: 2,
  MAX_PAUSE_DURATION_MS: 600_000,
  GPS_INTERVAL_MS: 5_000,
  POINT_DENSITY_TOLERANCE: 0.6,
}

interface Coord {
  lat: number
  lng: number
  timestamp: number
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function calcDistance(coords: Coord[]): number {
  let total = 0
  for (let i = 1; i < coords.length; i++) {
    total += haversineMeters(coords[i - 1].lat, coords[i - 1].lng, coords[i].lat, coords[i].lng)
  }
  return Math.round(total)
}

function validateSpeed(coords: Coord[], goalType: 'walk' | 'run'): string | null {
  const maxSpeed = RULES[goalType].maxSpeedKmh
  for (let i = 1; i < coords.length; i++) {
    const dist = haversineMeters(coords[i - 1].lat, coords[i - 1].lng, coords[i].lat, coords[i].lng) / 1000
    const hrs = (coords[i].timestamp - coords[i - 1].timestamp) / 3_600_000
    if (hrs <= 0) continue
    if (dist / hrs > maxSpeed) return `Speed too high: ${(dist / hrs).toFixed(1)} km/h`
  }
  return null
}

function validateDuration(durationSec: number, distMeters: number, goalType: 'walk' | 'run'): string | null {
  const minExpected = (RULES[goalType].minMinutesPerKm * distMeters) / 1000
  if (durationSec / 60 < minExpected)
    return `Duration too short: ${(durationSec / 60).toFixed(1)}min for ${(distMeters / 1000).toFixed(2)}km`
  return null
}

function validateContinuity(coords: Coord[]): string | null {
  for (let i = 1; i < coords.length; i++) {
    const gap = haversineMeters(coords[i - 1].lat, coords[i - 1].lng, coords[i].lat, coords[i].lng)
    if (gap > RULES.MAX_GAP_METERS) return `GPS gap too large: ${gap.toFixed(0)}m`
  }
  return null
}

function validateDensity(coords: Coord[], durationSec: number): string | null {
  const expected = Math.floor(durationSec / (RULES.GPS_INTERVAL_MS / 1000))
  const min = Math.floor(expected * RULES.POINT_DENSITY_TOLERANCE)
  if (coords.length < min) return `Too few GPS points: ${coords.length} (expected ~${expected})`
  return null
}

// ─── Sign proof using viem ───────────────────────────────────

async function signProof(
  commitmentId: string,
  actualDistance: number,
  actualSteps: number
): Promise<{ proofNonce: string; signature: string }> {
  const key = process.env.VERIFIER_PRIVATE_KEY as `0x${string}`
  if (!key) throw new Error('VERIFIER_PRIVATE_KEY not configured')

  const account = privateKeyToAccount(key)
  const proofNonce = `0x${randomBytes(32).toString('hex')}` as `0x${string}`

  const msgHash = keccak256(
    encodePacked(
      ['bytes32', 'uint256', 'uint256', 'bytes32'],
      [commitmentId as `0x${string}`, BigInt(actualDistance), BigInt(actualSteps), proofNonce]
    )
  )

  // signMessage with raw bytes → prepends "\x19Ethereum Signed Message:\n32" (matches toEthSignedMessageHash)
  const signature = await account.signMessage({ message: { raw: msgHash } })

  return { proofNonce, signature }
}

// ─── Route handler ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: {
    commitmentId: string
    coordinates: Coord[]
    goalType: string
    goalCategory: string
    goalValue: number
    durationSeconds: number
    pauseCount: number
    totalPauseDurationMs: number
    estimatedSteps?: number
    demo?: boolean
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    commitmentId,
    coordinates,
    goalType,
    goalCategory,
    goalValue,
    durationSeconds,
    pauseCount,
    totalPauseDurationMs,
    estimatedSteps,
    demo,
  } = body

  // Demo / test mode: lets the full session flow be exercised without physically
  // completing an outdoor route. Honoured ONLY outside production so it can never
  // be used to drain the live reward pool. It skips the anti-cheat checks and
  // signs a proof that meets the goal.
  const demoAllowed = demo === true && process.env.NODE_ENV !== 'production'

  if (!commitmentId)
    return NextResponse.json({ error: 'Missing commitmentId' }, { status: 400 })

  if (!demoAllowed && (!Array.isArray(coordinates) || coordinates.length < 2))
    return NextResponse.json({ error: 'Missing required fields or not enough GPS points' }, { status: 400 })

  if (!['walk', 'run'].includes(goalType))
    return NextResponse.json({ error: 'Invalid goalType' }, { status: 400 })

  const type = goalType as 'walk' | 'run'

  if (demoAllowed) {
    const measured = Array.isArray(coordinates) && coordinates.length >= 2 ? calcDistance(coordinates) : 0
    const actualDistanceMeters = goalCategory === 'distance' ? Math.max(measured, goalValue) : measured
    const actualSteps = goalCategory === 'steps' ? Math.max(estimatedSteps ?? 0, goalValue) : (estimatedSteps ?? 0)
    try {
      const { proofNonce, signature } = await signProof(commitmentId, actualDistanceMeters, actualSteps)
      return NextResponse.json({
        success: true,
        demo: true,
        proof: { commitmentId, actualDistance: actualDistanceMeters, actualSteps, proofNonce, signature },
      })
    } catch (err) {
      console.error('Signing error (demo):', err)
      return NextResponse.json({ error: 'Proof signing failed' }, { status: 500 })
    }
  }

  if (pauseCount > RULES.MAX_PAUSE_COUNT)
    return NextResponse.json({ error: `Too many pauses: ${pauseCount}` }, { status: 400 })

  if (totalPauseDurationMs > RULES.MAX_PAUSE_DURATION_MS)
    return NextResponse.json({ error: 'Total pause time exceeded 10 minutes' }, { status: 400 })

  const speedErr = validateSpeed(coordinates, type)
  if (speedErr) return NextResponse.json({ error: speedErr }, { status: 400 })

  const actualDistanceMeters = calcDistance(coordinates)

  const durationErr = validateDuration(durationSeconds, actualDistanceMeters, type)
  if (durationErr) return NextResponse.json({ error: durationErr }, { status: 400 })

  const continuityErr = validateContinuity(coordinates)
  if (continuityErr) return NextResponse.json({ error: continuityErr }, { status: 400 })

  const densityErr = validateDensity(coordinates, durationSeconds)
  if (densityErr) return NextResponse.json({ error: densityErr }, { status: 400 })

  const actualSteps = estimatedSteps ?? 0

  if (goalCategory === 'distance' && actualDistanceMeters < goalValue)
    return NextResponse.json(
      { error: `Distance goal not met: ${actualDistanceMeters}m of ${goalValue}m` },
      { status: 400 }
    )

  if (goalCategory === 'steps' && actualSteps < goalValue)
    return NextResponse.json(
      { error: `Step goal not met: ${actualSteps} of ${goalValue} steps` },
      { status: 400 }
    )

  try {
    const { proofNonce, signature } = await signProof(commitmentId, actualDistanceMeters, actualSteps)
    return NextResponse.json({
      success: true,
      proof: { commitmentId, actualDistance: actualDistanceMeters, actualSteps, proofNonce, signature },
    })
  } catch (err) {
    console.error('Signing error:', err)
    return NextResponse.json({ error: 'Proof signing failed' }, { status: 500 })
  }
}
