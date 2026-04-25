from __future__ import annotations

from typing import List

from bson import ObjectId
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/properties", response_model=List[Property])
async def list_properties() -> List[Property]:
    docs = await properties_collection.find({}).to_list(length=1000)
    return [property_from_mongo(d) for d in docs]


@app.get("/properties/{property_id}", response_model=Property)
async def get_property(property_id: str) -> Property:
    try:
        oid = ObjectId(property_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid property_id format")

    doc = await properties_collection.find_one({"_id": oid})
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

