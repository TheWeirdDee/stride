# Stride

> Commit to your movement. Prove it on-chain. Get rewarded.

Stride is a MiniPay-native fitness accountability app built on Celo. Users stake USDm as a personal commitment to a walk or run goal, track their live GPS route, and automatically receive their stake back plus a bonus reward when they complete it.

**No competition. No leaderboards. Just you, your goal, and your word on-chain.**

---

## Deployed Contracts — Celo Mainnet

| Contract | Address |
|---|---|
| StrideRewardPool | [0xf9A538c04f580eDf8c51069555ED6B880552C337](https://celoscan.io/address/0xf9A538c04f580eDf8c51069555ED6B880552C337#code) |
| StrideCommitment | [0x3ebbFE73400E5D65477c61EE3b5278c56fBa6a77](https://celoscan.io/address/0x3ebbFE73400E5D65477c61EE3b5278c56fBa6a77#code) |

Both contracts are verified on Celoscan.

---

## What Stride Does

- Users browse and explore the app with no wallet required
- When ready, they create a **Commitment** — a GPS-based movement goal with a USDm stake (minimum $0.01)
- The stake is locked in a smart contract on Celo
- During the session, the app tracks their live GPS route on a map (Strava-style)
- When the goal is completed, on-chain proof is submitted automatically
- The smart contract releases the original stake + a bonus reward to their MiniPay wallet

---

## Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Celo Mainnet |
| Smart Contracts | Solidity 0.8.28 + Hardhat |
| Frontend | Next.js (App Router) |
| Wallet / Payments | MiniPay + wagmi + viem |
| Maps | Mapbox GL JS |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | Supabase (Postgres) |
| Deployment | Netlify |

---

## Project Structure

```
stride/
├── contracts/              # Hardhat project
│   ├── contracts/
│   │   ├── StrideCommitment.sol
│   │   ├── StrideRewardPool.sol
│   │   └── mocks/
│   ├── deploy/
│   ├── test/
│   └── deployments/
├── src/                    # Next.js frontend (App Router)
│   └── app/
├── backend/                # GPS verification service
└── public/
```

---

## Getting Started

### Contracts

```bash
cd contracts
npm install
cp .env.example .env   # fill in your keys
npx hardhat compile
npx hardhat run deploy/01_deploy_reward_pool.js --network celo
npx hardhat run deploy/02_deploy_commitment.js --network celo
```

### Frontend

```bash
npm install
cp .env.local.example .env.local   # fill in your keys
npm run dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in VERIFIER_PRIVATE_KEY
node server.js
```

---

## License

MIT
