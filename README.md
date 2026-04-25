# Homenet (Hackathon Demo)

Homenet is a real estate tokenization demo with:

- **Backend**: Python **FastAPI** service exposing property + user endpoints (local JSON datastore)
- **Frontend**: **Next.js 14** dashboard that fetches properties from the backend and mints a **Metaplex Core** digital asset on **Solana Devnet** when you click **Invest**

---

## Repo structure

- `main.py` — FastAPI app (API routes + a small HTML demo page at `/`)
- `database.py` — JSON-file datastore abstraction (`data.json`)
- `seed.py` — seeds `data.json` with demo properties
- `frontend/` — Next.js 14 App Router dashboard (Solana wallet + Metaplex mint)

---

## Prerequisites (local laptop)

### Backend
- Python **3.9+**

### Frontend
- Node.js **18+** and npm

### Wallet (for the demo mint)
- **Phantom** browser wallet
- Set Phantom network to **Devnet** (or enable Devnet in Phantom settings)
- Have some **Devnet SOL** (use a faucet inside Phantom or a Solana Devnet faucet)

---

## 1) Backend: install + run

From the repo root:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py
uvicorn main:app --host 0.0.0.0 --port 8000
```

Test it:

- `http://localhost:8000/properties`

Environment:

- `.env` supports `DATA_FILE=./data.json` (defaults to `./data.json` if unset)

---

## 2) Frontend: install + run

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:

- `http://localhost:3000`

Frontend env:

- `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## What the frontend does

### Property grid (from backend)

The dashboard fetches:

- `GET http://localhost:8000/properties`

and renders each property into a card.

### Invest button (Solana Devnet mint)

When you click **Invest**, the app:

1. Uses the connected wallet via `@solana/wallet-adapter-react`
2. Initializes Umi against **Devnet** RPC (`clusterApiUrl("devnet")`)
3. Uses Metaplex Core `create(...)` to mint a new asset:
   - `name`: the property’s `address`
   - `uri`: empty string

On success, it shows a toast with a link to the transaction on:

- `https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet`

---

## Troubleshooting

### Backend port already in use

If `8000` is in use, pick another port:

```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

Then update `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
```

### CORS / fetch fails in the frontend

Make sure the backend is running and reachable at the URL in `NEXT_PUBLIC_API_BASE_URL`.

### Phantom not connecting / no Devnet SOL

- Confirm Phantom is set to **Devnet**
- Airdrop Devnet SOL in Phantom (or use a Devnet faucet)

---

## Commands quick list

Backend:

```bash
source venv/bin/activate
python seed.py
uvicorn main:app --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm run dev
```

