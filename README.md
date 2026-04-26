# Homenet — (RWA Tokenization on Solana Devnet)

Homenet is a demo real-estate tokenization dashboard:
- **Backend (FastAPI / Python)** serves property data from a local JSON datastore.
- **Frontend (Next.js 14 / Tailwind)** displays properties and lets you:
  - **Invest**: mint a new **Metaplex Core** asset on **Solana Devnet**
  - **Sell Position**: simulate instant liquidity via **wallet message signing**
- **RWA Trading Terminal**: polls **Helius DAS** on Devnet and shows a live log + TVL chart.

---

## Tech Stack

### Backend
- Python 3.9+
- FastAPI
- Uvicorn
- Pydantic
- Local JSON datastore (`data.json`)

### Frontend
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Solana Wallet Adapter (Phantom)
- Metaplex Core + Umi (minting)
- Recharts (terminal chart)
- Sonner (toasts)
- Lucide (icons)

### Blockchain / Infra
- Solana **Devnet**
- Helius Devnet RPC + DAS API (asset discovery polling)

---

## Repo Layout

- `main.py` — FastAPI app (API + simple HTML demo page at `/`)
- `database.py` — JSON file datastore abstraction (async-safe)
- `seed.py` — generates demo properties in `data.json`
- `data.json` — local data persisted for demo
- `frontend/` — Next.js dashboard

Key frontend files:
- `frontend/src/components/property-card.tsx` — Invest (mint) + Sell (sign message) flows
- `frontend/src/components/solana-provider.tsx` — wallet provider (Devnet)
- `frontend/src/components/rwa-terminal.tsx` — Helius DAS polling + terminal + TVL chart
- `frontend/src/app/page.tsx` — dashboard page

---

## Prerequisites

### Required
- **Python 3.9+**
- **Node.js 18+** + npm
- **Phantom wallet** (browser extension)

### Wallet setup (IMPORTANT)
- Set Phantom network to **Devnet**
- Get some **Devnet SOL**
  - Use Phantom’s airdrop / faucet features, or any Solana Devnet faucet

---

## Quickstart (Run Locally)

### 1) Backend (FastAPI)
From the repo root:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

python seed.py
uvicorn main:app --host 0.0.0.0 --port 8000
```

Test:
- `http://localhost:8000/properties`

> The backend uses `DATA_FILE=./data.json` (see `.env`). If you change the backend port, update the frontend env (below).

---

### 2) Frontend (Next.js)
In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:
- `http://localhost:3000`

Frontend env:
- `frontend/.env.local` should include:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## How the Demo Works

### Property Dashboard
- The UI fetches properties from:
  - `GET http://localhost:8000/properties`
- Each card shows: address, price, APY, available tokens.

### Invest (Mint on Solana Devnet)
- Clicking **Invest** mints a new Metaplex Core asset:
  - Uses the connected Phantom wallet (Wallet Adapter)
  - Uses **Umi** + **Metaplex Core `create(...)`**
  - Asset name is the property address (demo)
- A toast appears with a link to:
  - `https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet`

### Sell Position (Instant Liquidity Simulation)
- After minting, the button becomes **Sell Position**.
- Clicking **Sell Position**:
  - calls `signMessage()` in Phantom
  - shows toast: “Asset Liquidated. USDC transferred to wallet.”
  - reverts the card back to **Invest**
  - emits a custom event that the RWA Terminal logs as a liquidation line.

### RWA Trading Terminal (Helius DAS)
- Polls Helius DAS every 10s using `getAssetsByAuthority`.
- Dedupes assets so it only logs newly detected asset IDs.
- Updates the live TVL chart when new assets are detected.
- Heartbeat messages append every ~3s to keep the UI “alive”.

---

## Troubleshooting

### “Transaction reverted during simulation”
Most common causes:
- Phantom is on **Mainnet** (must be **Devnet**)
- You have **0 Devnet SOL** (minting needs rent/fees)

### Backend port already in use
Use another port:
```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

Update frontend:
```bash
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
```

---

## Demo Script (for presentations)
1. Start backend, run `seed.py`, run uvicorn on `:8000`
2. Start frontend on `:3000`
3. Open dashboard, connect Phantom on **Devnet**
4. Click **Invest** → show Solana Explorer tx link
5. Click **Sell Position** → sign message → show “USDC transferred” toast
6. Point to RWA Trading Terminal: “mint detected” + TVL chart updates + liquidation log

