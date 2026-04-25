from __future__ import annotations

import re
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from database import client, properties_collection, users_collection
from models import Property, User, UserCreate, property_from_mongo, user_from_mongo

app = FastAPI(title="Web3 Real Estate Off-chain API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
def _shutdown() -> None:
    client.close()


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def home() -> str:
    return """
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Homenet Demo</title>
    <style>
      :root { color-scheme: light dark; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; margin: 0; }
      header { padding: 24px 20px; border-bottom: 1px solid rgba(127,127,127,.25); }
      main { padding: 20px; max-width: 980px; margin: 0 auto; }
      .row { display: grid; grid-template-columns: 1fr; gap: 14px; }
      .card { border: 1px solid rgba(127,127,127,.25); border-radius: 14px; padding: 14px; background: rgba(127,127,127,.07); }
      .muted { opacity: .75; }
      a { color: inherit; }
      input, button { font: inherit; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(127,127,127,.35); background: transparent; }
      button { cursor: pointer; }
      ul { margin: 10px 0 0; padding-left: 18px; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
      .kv { display: grid; grid-template-columns: 150px 1fr; gap: 6px 12px; margin-top: 10px; }
      .kv div { padding: 6px 0; border-bottom: 1px dashed rgba(127,127,127,.25); }
      @media (min-width: 900px) { .row { grid-template-columns: 1.2fr .8fr; } }
    </style>
  </head>
  <body>
    <header>
      <div style="max-width:980px;margin:0 auto;">
        <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-size:20px;font-weight:700;">Homenet Demo (Local)</div>
            <div class="muted">Off-chain API + JSON datastore</div>
          </div>
          <div class="muted">
            API docs: <a href="/docs">/docs</a>
          </div>
        </div>
      </div>
    </header>

    <main>
      <div class="row">
        <section class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
            <div>
              <div style="font-weight:700;">Properties</div>
              <div class="muted">Loaded from <code>GET /properties</code></div>
            </div>
            <button id="refreshBtn" type="button">Refresh</button>
          </div>
          <div id="propsStatus" class="muted" style="margin-top:10px;">Loading…</div>
          <ul id="propsList"></ul>
        </section>

        <section class="card">
          <div style="font-weight:700;">Create / Get User</div>
          <div class="muted">Calls <code>POST /users</code> and returns the same user for the same wallet.</div>

          <div style="display:flex;gap:10px;align-items:center;margin-top:12px;flex-wrap:wrap;">
            <input id="walletInput" type="text" placeholder="Wallet address (e.g. 0xabc…)" style="flex:1;min-width:240px;" />
            <button id="userBtn" type="button">Submit</button>
          </div>

          <div id="userOut" style="margin-top:12px;" class="muted">No request yet.</div>
          <div id="userKv" class="kv" style="display:none;"></div>
        </section>
      </div>
    </main>

    <script>
      const propsStatus = document.getElementById('propsStatus');
      const propsList = document.getElementById('propsList');
      const refreshBtn = document.getElementById('refreshBtn');

      const walletInput = document.getElementById('walletInput');
      const userBtn = document.getElementById('userBtn');
      const userOut = document.getElementById('userOut');
      const userKv = document.getElementById('userKv');

      function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      }

      async function loadProperties() {
        propsStatus.textContent = 'Loading…';
        propsList.innerHTML = '';
        try {
          const res = await fetch('/properties');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const items = await res.json();
          propsStatus.textContent = items.length ? ('Loaded ' + items.length + ' properties.') : 'No properties found (did you run seed.py?).';
          for (const p of items) {
            const li = document.createElement('li');
            li.innerHTML = `
              <div style="font-weight:600;">${escapeHtml(p.address)} <span class="muted">(${escapeHtml(p.id)})</span></div>
              <div class="muted">Price: $${escapeHtml(p.price)} • Tokens: ${escapeHtml(p.available_tokens)}/${escapeHtml(p.total_tokens)} • APY: ${escapeHtml(p.apy_percentage)}%</div>
            `;
            propsList.appendChild(li);
          }
        } catch (e) {
          propsStatus.textContent = 'Failed to load properties: ' + e;
        }
      }

      function renderUser(u) {
        userOut.textContent = 'Success.';
        userKv.style.display = 'grid';
        userKv.innerHTML = `
          <div class="muted">id</div><div><code>${escapeHtml(u.id)}</code></div>
          <div class="muted">wallet</div><div><code>${escapeHtml(u.wallet_address)}</code></div>
          <div class="muted">kyc_verified</div><div><code>${escapeHtml(u.kyc_verified)}</code></div>
        `;
      }

      async function submitUser() {
        const wallet = walletInput.value.trim();
        if (!wallet) {
          userOut.textContent = 'Enter a wallet address first.';
          userKv.style.display = 'none';
          return;
        }
        userOut.textContent = 'Submitting…';
        userKv.style.display = 'none';
        try {
          const res = await fetch('/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet_address: wallet })
          });
          const data = await res.json();
          if (!res.ok) throw new Error((data && data.detail) ? data.detail : ('HTTP ' + res.status));
          renderUser(data);
        } catch (e) {
          userOut.textContent = 'Failed: ' + e;
        }
      }

      refreshBtn.addEventListener('click', loadProperties);
      userBtn.addEventListener('click', submitUser);
      walletInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitUser(); });

      loadProperties();
    </script>
  </body>
</html>
"""


@app.get("/properties", response_model=List[Property])
async def list_properties() -> List[Property]:
    docs = await properties_collection.find({}).to_list(length=1000)
    return [property_from_mongo(d) for d in docs]


@app.get("/properties/{property_id}", response_model=Property)
async def get_property(property_id: str) -> Property:
    pid = property_id.strip().lower()
    if not re.fullmatch(r"[0-9a-f]{24}", pid):
        raise HTTPException(status_code=400, detail="Invalid property_id format")

    doc = await properties_collection.find_one({"_id": pid})
    if not doc:
        raise HTTPException(status_code=404, detail="Property not found")

    return property_from_mongo(doc)


@app.post("/users", response_model=User)
async def create_or_get_user(payload: UserCreate) -> User:
    wallet = payload.wallet_address.strip().lower()
    if not wallet:
        raise HTTPException(status_code=400, detail="wallet_address is required")

    existing = await users_collection.find_one({"wallet_address": wallet})
    if existing:
        return user_from_mongo(existing)

    insert_result = await users_collection.insert_one(
        {"wallet_address": wallet, "kyc_verified": False}
    )
    created = await users_collection.find_one({"_id": insert_result.inserted_id})
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create user")

    return user_from_mongo(created)

