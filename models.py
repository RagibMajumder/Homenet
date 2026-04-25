from __future__ import annotations

from typing import Any, Mapping

from pydantic import BaseModel, ConfigDict, Field


class Property(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    address: str
    price: float
    total_tokens: int
    available_tokens: int
    apy_percentage: float
    ipfs_image_cid: str


class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    wallet_address: str
    kyc_verified: bool


class UserCreate(BaseModel):
    wallet_address: str = Field(..., min_length=1)


def _stringify_object_id(value: Any) -> str:
    return str(value)


def property_from_mongo(doc: Mapping[str, Any]) -> Property:
    return Property(
        id=_stringify_object_id(doc.get("_id")),
        address=str(doc.get("address", "")),
        price=float(doc.get("price", 0)),
        total_tokens=int(doc.get("total_tokens", 0)),
        available_tokens=int(doc.get("available_tokens", 0)),
        apy_percentage=float(doc.get("apy_percentage", 0)),
        ipfs_image_cid=str(doc.get("ipfs_image_cid", "")),
    )


def user_from_mongo(doc: Mapping[str, Any]) -> User:
    return User(
        id=_stringify_object_id(doc.get("_id")),
        wallet_address=str(doc.get("wallet_address", "")),
        kyc_verified=bool(doc.get("kyc_verified", False)),
    )

