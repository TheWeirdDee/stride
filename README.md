# Stride 🏃

> Commit to your movement. Prove it on-chain. Get rewarded.

Stride is a MiniPay-native fitness accountability app built on Celo. Users stake cUSD as a personal commitment to a walk or run goal, track their live GPS route, and automatically receive their stake back plus a bonus reward when they complete it.

**No competition. No leaderboards. Just you, your goal, and your word on-chain.**

---

## What Stride Does

- Users browse and explore the app with no wallet required
- When ready, they create a **Commitment** — a GPS-based movement goal with a cUSD stake (minimum $0.01)
- The stake is locked in a smart contract on Celo
- During the session, the app tracks their live GPS route on a map (Strava-style)
- When the goal is completed, on-chain proof is submitted automatically
- The smart contract releases the original stake + a bonus reward to their MiniPay wallet

---

## Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Celo Mainnet |
| Smart Contracts | Solidity + Hardhat |
| Frontend | Next.js 14 (App Router) |
| Wallet / Payments | MiniPay + wagmi + viem |
| Maps | Mapbox GL JS |
| Styling | Tailwind CSS |
| Backend | Node.js + Express (optional, for GPS verification assist) |
| Database | Supabase (Postgres) |
| Deployment | Vercel (frontend) |

---

## Project Structure

```
stride/
├── contracts/              # Solidity smart contracts
│   ├── StrideCommitment.sol
│   ├── StrideRewardPool.sol
│   └── deploy/
├── frontend/               # Next.js app
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Helpers and constants
│   │   └── context/        # Global state
│   └── public/
├── backend/                # GPS verification service (optional)
├── docs/                   # Documentation
│   ├── SMART_CONTRACTS.md
│   ├── ARCHITECTURE.md
│   ├── MINIPAY.md
│   └── ANTI_GAMING.md
├── BUILD_PLAN.md           # 15-day build plan
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Celo wallet with cUSD for deployment
- Hardhat
- MiniPay (Opera Mini with MiniPay) for testing on device

### Install

```bash
git clone https://github.com/yourusername/stride
cd stride
npm install
```

### Deploy Contracts

```bash
cd contracts
npx hardhat compile
npx hardhat run deploy/deploy.js --network celo
```

See [SMART_CONTRACTS.md](./docs/SMART_CONTRACTS.md) for full deployment guide.

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Key Links

- [Smart Contract Docs](./docs/SMART_CONTRACTS.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [MiniPay Integration Guide](./docs/MINIPAY.md)
- [Anti-Gaming Strategy](./docs/ANTI_GAMING.md)
- [15-Day Build Plan](./BUILD_PLAN.md)

---

## License

MIT — your code, your IP.
