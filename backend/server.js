// backend/server.js
// Stride GPS Verifier Service
// Validates GPS session data and signs completion proofs

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
app.use(express.json({ limit: "5mb" })); // GPS arrays can be large
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));

// Verifier wallet — signs completion proofs
const verifierWallet = new ethers.Wallet(process.env.VERIFIER_PRIVATE_KEY);
console.log("Verifier address:", verifierWallet.address);

// ─── Validation Constants ─────────────────────────────────

const RULES = {
  walk: {
    maxSpeedKmh: 8,
    minMinutesPerKm: 7,
  },
  run: {
    maxSpeedKmh: 25,
    minMinutesPerKm: 3.5,
  },
  MAX_GAP_METERS: 200,         // max jump between consecutive GPS points
  MAX_PAUSE_COUNT: 2,
  MAX_PAUSE_DURATION_MS: 600000, // 10 minutes total pause
  GPS_INTERVAL_MS: 5000,        // expected GPS point every 5s
  POINT_DENSITY_TOLERANCE: 0.6, // accept 60% of expected points
};

// ─── Haversine Distance ───────────────────────────────────

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Validators ───────────────────────────────────────────

function validateSpeed(coordinates, goalType) {
  const maxSpeed = RULES[goalType]?.maxSpeedKmh || RULES.walk.maxSpeedKmh;
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];
    const distKm = haversineMeters(prev.lat, prev.lng, curr.lat, curr.lng) / 1000;
    const timeHours = (curr.timestamp - prev.timestamp) / 3600000;
    if (timeHours <= 0) continue;
    const speed = distKm / timeHours;
    if (speed > maxSpeed) {
      return { valid: false, reason: `Speed too high: ${speed.toFixed(1)} km/h` };
    }
  }
  return { valid: true };
}

function validateDuration(durationSeconds, actualDistanceMeters, goalType) {
  const durationMinutes = durationSeconds / 60;
  const distanceKm = actualDistanceMeters / 1000;
  const minExpected = (RULES[goalType]?.minMinutesPerKm || 7) * distanceKm;
  if (durationMinutes < minExpected) {
    return {
      valid: false,
      reason: `Duration too short: ${durationMinutes.toFixed(1)}min for ${distanceKm.toFixed(2)}km`,
    };
  }
  return { valid: true };
}

function validateContinuity(coordinates) {
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];
    const gap = haversineMeters(prev.lat, prev.lng, curr.lat, curr.lng);
    if (gap > RULES.MAX_GAP_METERS) {
      return { valid: false, reason: `GPS gap too large: ${gap.toFixed(0)}m` };
    }
  }
  return { valid: true };
}

function validatePointDensity(coordinates, durationSeconds) {
  const expectedPoints = Math.floor(durationSeconds / (RULES.GPS_INTERVAL_MS / 1000));
  const minAcceptable = Math.floor(expectedPoints * RULES.POINT_DENSITY_TOLERANCE);
  if (coordinates.length < minAcceptable) {
    return {
      valid: false,
      reason: `Too few GPS points: ${coordinates.length} (expected ~${expectedPoints})`,
    };
  }
  return { valid: true };
}

function calculateDistance(coordinates) {
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    total += haversineMeters(
      coordinates[i - 1].lat,
      coordinates[i - 1].lng,
      coordinates[i].lat,
      coordinates[i].lng
    );
  }
  return Math.round(total);
}

// ─── Sign Completion Proof ────────────────────────────────

async function signCompletionProof(commitmentId, actualDistance, actualSteps) {
  const proofNonce = ethers.randomBytes(32);
  const proofNonceHex = ethers.hexlify(proofNonce);

  const messageHash = ethers.solidityPackedKeccak256(
    ["bytes32", "uint256", "uint256", "bytes32"],
    [commitmentId, actualDistance, actualSteps, proofNonceHex]
  );

  const signature = await verifierWallet.signMessage(ethers.getBytes(messageHash));

  return { proofNonce: proofNonceHex, signature };
}

// ─── API Routes ───────────────────────────────────────────

/**
 * POST /api/verify-session
 *
 * Body:
 * {
 *   commitmentId: string (bytes32 hex)
 *   coordinates: Array<{ lat: number, lng: number, timestamp: number }>
 *   goalType: "walk" | "run"
 *   goalCategory: "distance" | "steps"
 *   goalValue: number (meters or steps)
 *   durationSeconds: number
 *   pauseCount: number
 *   totalPauseDurationMs: number
 *   estimatedSteps: number (optional)
 * }
 */
app.post("/api/verify-session", async (req, res) => {
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
  } = req.body;

  if (!commitmentId || !coordinates || !Array.isArray(coordinates)) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (coordinates.length < 2) {
    return res.status(400).json({ error: "Not enough GPS points" });
  }
  if (!["walk", "run"].includes(goalType)) {
    return res.status(400).json({ error: "Invalid goalType" });
  }

  if (pauseCount > RULES.MAX_PAUSE_COUNT) {
    return res.status(400).json({ error: `Too many pauses: ${pauseCount}` });
  }
  if (totalPauseDurationMs > RULES.MAX_PAUSE_DURATION_MS) {
    return res.status(400).json({ error: "Total pause time exceeded 10 minutes" });
  }

  const speedCheck = validateSpeed(coordinates, goalType);
  if (!speedCheck.valid) {
    return res.status(400).json({ error: speedCheck.reason });
  }

  const actualDistanceMeters = calculateDistance(coordinates);

  const durationCheck = validateDuration(durationSeconds, actualDistanceMeters, goalType);
  if (!durationCheck.valid) {
    return res.status(400).json({ error: durationCheck.reason });
  }

  const continuityCheck = validateContinuity(coordinates);
  if (!continuityCheck.valid) {
    return res.status(400).json({ error: continuityCheck.reason });
  }

  const densityCheck = validatePointDensity(coordinates, durationSeconds);
  if (!densityCheck.valid) {
    return res.status(400).json({ error: densityCheck.reason });
  }

  const actualSteps = estimatedSteps || 0;

  if (goalCategory === "distance" && actualDistanceMeters < goalValue) {
    return res.status(400).json({
      error: `Distance goal not met: ${actualDistanceMeters}m of ${goalValue}m`,
    });
  }
  if (goalCategory === "steps" && actualSteps < goalValue) {
    return res.status(400).json({
      error: `Step goal not met: ${actualSteps} of ${goalValue} steps`,
    });
  }

  try {
    const { proofNonce, signature } = await signCompletionProof(
      commitmentId,
      actualDistanceMeters,
      actualSteps
    );

    return res.json({
      success: true,
      proof: {
        commitmentId,
        actualDistance: actualDistanceMeters,
        actualSteps,
        proofNonce,
        signature,
      },
    });
  } catch (err) {
    console.error("Signing error:", err);
    return res.status(500).json({ error: "Proof signing failed" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", verifier: verifierWallet.address });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Stride verifier running on port ${PORT}`);
});
