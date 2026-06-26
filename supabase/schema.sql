-- Supabase Database Schema for Stride
-- Contains tables for users, commitments, sessions, routes, and workout content.

-- 1. Enable UUID generation extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create 'users' table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    nickname TEXT,
    city TEXT,
    fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'active')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    streak_current INTEGER DEFAULT 0 NOT NULL,
    streak_best INTEGER DEFAULT 0 NOT NULL,
    total_distance NUMERIC DEFAULT 0 NOT NULL, -- in meters
    total_earnings NUMERIC DEFAULT 0 NOT NULL  -- in USDm
);

-- Index for fast user lookups by wallet address
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- 3. Create 'commitments' table
CREATE TABLE IF NOT EXISTS commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id_chain TEXT UNIQUE, -- bytes32 hex from contract
    wallet_address TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
    stake_amount NUMERIC NOT NULL,   -- USDm stake
    goal_type TEXT NOT NULL CHECK (goal_type IN ('distance', 'steps')),
    goal_value NUMERIC NOT NULL,    -- meters or steps
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'forfeited', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    bonus_earned NUMERIC DEFAULT 0
);

-- Indices for commitments
CREATE INDEX IF NOT EXISTS idx_commitments_wallet_address ON commitments(wallet_address);
CREATE INDEX IF NOT EXISTS idx_commitments_chain_id ON commitments(commitment_id_chain);

-- 4. Create 'sessions' table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id UUID REFERENCES commitments(id) ON DELETE SET NULL,
    wallet_address TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    actual_distance NUMERIC NOT NULL, -- meters
    actual_steps INTEGER DEFAULT 0 NOT NULL,
    duration_secs INTEGER NOT NULL,
    avg_pace NUMERIC NOT NULL          -- min/km
);

-- Indices for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_commitment_id ON sessions(commitment_id);
CREATE INDEX IF NOT EXISTS idx_sessions_wallet_address ON sessions(wallet_address);

-- 5. Create 'routes' table
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID UNIQUE NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    coordinates JSONB NOT NULL, -- array of {lat, lng, timestamp}
    map_snapshot TEXT           -- URL to generated route image (optional)
);

-- 6. Create 'content' table (Workout content hub)
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('warmup', 'cooldown', 'guide')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    duration INTEGER NOT NULL, -- minutes
    phase TEXT NOT NULL CHECK (phase IN ('before', 'after', 'anytime')),
    activity TEXT NOT NULL CHECK (activity IN ('walk', 'run', 'both')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed MVP content into 'content' table
INSERT INTO content (type, title, body, duration, phase, activity) VALUES
-- Pre-Walk Warmup (5 min)
(
    'warmup', 
    'Pre-Walk Warmup', 
    '1. Ankle circles — Rotate each ankle clockwise and counter-clockwise for 30 seconds to loosen up the joint.\n2. Knee lifts — Stand tall and bring each knee up to hip height alternately, performing 20 repetitions.\n3. Hip circles — Place hands on hips and rotate hips in large circles, doing 10 reps in each direction.\n4. Arm swings — Swing arms forward and backward gently for 30 seconds to warm up the upper body.\n5. Neck rolls — Slowly roll neck in a semi-circle, 30 seconds on each side.\n6. Side steps — Step side-to-side dynamically for 1 minute to activate glutes and thighs.', 
    5, 
    'before', 
    'walk'
),
-- Pre-Run Warmup (8 min)
(
    'warmup', 
    'Pre-Run Warmup', 
    '1. Leg swings — Hold a support and swing one leg forward and backward dynamically, 30 seconds per leg.\n2. Hip flexor stretch — Perform dynamic lunges, holding briefly at the bottom to open up hips. 30 seconds per side.\n3. High knees — Jog in place bringing knees up toward chest, for 1 minute.\n4. Butt kicks — Jog in place bringing heels up toward glutes, for 1 minute.\n5. Dynamic calf raises — Lift up onto toes and lower down dynamically, doing 20 repetitions.\n6. Light jog in place — Ease into the cardio flow with a soft jog for 2 minutes.\n7. A-skips — Skip forward bringing knees high and driving arms, for 1 minute.', 
    8, 
    'before', 
    'run'
),
-- Post-Walk Cooldown (5 min)
(
    'cooldown', 
    'Post-Walk Cooldown', 
    '1. Standing quad stretch — Hold ankle behind glutes, keeping knees aligned. Hold for 30 seconds each side.\n2. Standing calf stretch — Step one foot back, keep heel flat on the ground and lean forward. Hold for 30 seconds each side.\n3. Hip flexor lunge — Deep low lunge, pushing hips gently forward. Hold for 30 seconds each side.\n4. Seated hamstring stretch — Sit down, extend one leg and reach toward toes. Hold for 30 seconds each side.\n5. Shoulder rolls — Roll shoulders backward slowly for 30 seconds to release upper back tension.', 
    5, 
    'after', 
    'walk'
),
-- Post-Run Cooldown (10 min)
(
    'cooldown', 
    'Post-Run Cooldown', 
    '1. Gentle walk — Walk slowly for 2 minutes to bring heart rate back to resting levels.\n2. Standing quad stretch — Hold ankle behind glutes, keeping knees aligned. Hold for 45 seconds each side.\n3. Pigeon pose — Seated on floor with one leg bent forward and the other extended backward. Hold for 1 minute each side.\n4. Seated hamstring stretch — Reach toward toes with legs extended. Hold for 1 minute each side.\n5. IT band stretch — Cross one leg behind the other and lean torso toward the front leg side. Hold for 30 seconds each side.\n6. Calf stretch against wall — Press heel to ground with toe flexed against wall. Hold for 30 seconds each side.\n7. Seated spinal twist — Cross one leg over the other, twist torso towards the bent knee. Hold for 30 seconds each side.', 
    10, 
    'after', 
    'run'
),
-- Breathing Guide (Running)
(
    'guide', 
    'Breathing Guide for Runners', 
    '1. 2-2 Rhythmic Breathing — Coordinate inhaling for 2 steps and exhaling for 2 steps to synchronize diaphragm movements.\n2. Belly breathing (Diaphragmatic) — Breathe deep into your abdomen rather than shallowly into your chest.\n3. The Talk Test — Ensure you are running at a conversational pace. If you cannot speak a complete sentence without gasping, slow down.\n4. Transition slowly — When ending a run, transition to a jog and then a walk. Never stop abruptly to prevent dizziness.', 
    10, 
    'anytime', 
    'both'
),
-- Hydration Guide
(
    'guide', 
    'Moisture & Hydration Guidelines', 
    '1. Pre-hydrate — Drink 500ml of water about 30 minutes before starting your session.\n2. Carry water — Always carry fluid if planning a session exceeding 30 minutes or in high temperatures.\n3. Regular sips — Drink approximately 250ml of water every 20-25 minutes during your activity.\n4. Recovery rehydration — Drink another 500ml of water or electrolyte solution within 30 minutes of finishing.', 
    5, 
    'anytime', 
    'both'
),
-- Beginner's Guide: Your First 2km Walk
(
    'guide', 
    'Beginner Guide: Your First 2km', 
    '1. Pace yourself — Starting slow is key. There is no need to speed walk. Maintain a comfortable, sustainable pace.\n2. Shoe choice — Wear flat, supportive athletic shoes. Avoid sandals, slides, or heavy boots.\n3. Out and back — If unsure of route, walk 1km in one direction, then turn around. It ensures you do not get stuck far from home.\n4. Listen to body — If you experience sharp joint pain or extreme breathlessness, slow down or take a break.\n5. Consistency wins — Completing the distance is the goal. Celebrate showing up and logging the route on-chain.', 
    15,
    'anytime',
    'walk'
)
ON CONFLICT DO NOTHING;

-- 7. Create 'challenges' table (community challenges, user-creatable)
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_wallet TEXT NOT NULL,                       -- wallet address OR guest id of the creator
    title TEXT NOT NULL,
    description TEXT,
    activity TEXT NOT NULL CHECK (activity IN ('walk', 'run')),
    goal_value NUMERIC NOT NULL,                         -- target distance in meters
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    cover_url TEXT,                                      -- public URL in the 'challenge-covers' bucket
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_challenges_activity_status ON challenges(activity, status);
CREATE INDEX IF NOT EXISTS idx_challenges_creator ON challenges(creator_wallet);

-- 8. Create 'challenge_participants' table
CREATE TABLE IF NOT EXISTS challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    progress NUMERIC DEFAULT 0 NOT NULL,                 -- meters covered toward goal (cached)
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (challenge_id, wallet_address)
);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_wallet ON challenge_participants(wallet_address);

-- 9. Create 'groups' table (community groups, user-creatable)
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_wallet TEXT NOT NULL,                       -- wallet address OR guest id of the creator
    name TEXT NOT NULL,
    description TEXT,
    activity TEXT NOT NULL CHECK (activity IN ('walk', 'run')),
    city TEXT,
    cover_url TEXT,                                      -- public URL in the 'challenge-covers' bucket
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_groups_activity ON groups(activity);
CREATE INDEX IF NOT EXISTS idx_groups_creator ON groups(creator_wallet);

-- 10. Create 'group_members' table
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (group_id, wallet_address)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_wallet ON group_members(wallet_address);
