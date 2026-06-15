# Stride — Manual Test Checklist

There is no automated test suite (no `test` script, no frontend test files). The
real end-to-end flow needs a wallet (MiniPay or injected), device GPS, a live
Celo chain, and a configured Supabase project — so it must be verified manually.

## Automated gates (run before every push)

```bash
npx tsc --noEmit      # type-check
npm run lint          # eslint
npm run build         # production build (also type-checks + prerenders routes)
```

All three must pass. The build is the closest thing to an automated E2E gate.

## Prerequisites for manual testing

- Dev server running: `npm run dev`
- `.env.local` populated (contracts, Supabase URL/anon key, Mapbox token, backend URL)
- Supabase Storage bucket named **`route-cards`** created and public-read (for `map_snapshot`)
- A wallet with a little cUSD on the configured chain

---

## 1. Auth / navigation state

- [ ] Landing `/` with no profile → nav shows **Get Started**
- [ ] After guest onboarding → nav shows **Open App**, lands on `/explore`; navbar shows the nickname (never the word "Guest")
- [ ] After wallet connect → balance chip shows; no "Get Started"
- [ ] Navbar links resolve: Explore→`/explore`, Start→`/commitment/new`, Community→`/community`, Guides→`/content`, Profile→`/profile`
- [ ] No hydration mismatch warning in the console after a clean restart

## 2. Commitment creation (F3)

- [ ] Disconnected: stake step shows **"Wallet not connected"** (no false "insufficient cUSD"); can still advance
- [ ] Step 5 disconnected → **Connect Wallet** button
- [ ] Connected + low balance → genuine insufficient-funds error
- [ ] Confirm → approve + create prompts → redirects to `/session/[id]`
- [ ] Supabase `commitments` row written with `commitment_id_chain`, `status='active'`

## 3. Live session (F4)

- [ ] Start → GPS tracks; distance / time / pace / progress update
- [ ] Pause (max 2) and Resume behave; pause limit enforced
- [ ] End / Finish triggers verification

## 4. Completion + the critical write path (F5 / F6)

- [ ] Verify API signs proof → on-chain `completeCommitment` confirms
- [ ] **`sessions`** row inserted (commitment_id uuid, actual_distance, duration_secs, avg_pace)
- [ ] **`routes`** row inserted (coordinates jsonb)
- [ ] **`routes.map_snapshot`** is a non-null Storage URL (requires the `route-cards` bucket)
- [ ] `commitments` row flipped to `status='completed'` with `completed_at`
- [ ] **`users`** updated: `total_distance` += distance, `total_earnings` += bonus (from `CommitmentCompleted` event), `streak_current` / `streak_best` per day logic
- [ ] `/profile/routes` shows the session card (with the real snapshot image), summary stats, and the heatmap fills in
- [ ] `/profile` reflects new totals + streak

## 5. Streak logic edge cases

- [ ] First-ever completion → `streak_current = 1`
- [ ] Second completion same day → streak unchanged
- [ ] Completion the next calendar day → streak + 1
- [ ] Completion after a 2+ day gap → streak resets to 1
- [ ] `streak_best` only increases, never decreases

## 6. Content + community

- [ ] `/content` loads (Supabase or static fallback), search + tabs filter
- [ ] `/community` "Community Pulse" renders stats + live ticker

---

## Known gaps (expected to fail / not built)

- ❌ **All-routes single-map overlay** on `/profile/routes` — currently a per-route
  snapshot card grid + heatmap, not one combined Mapbox map of every route.
- ❌ **`/buddy`** accountability buddy system — Phase 2.
