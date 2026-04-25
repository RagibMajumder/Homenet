from __future__ import annotations

import asyncio
import json
import os
import secrets
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover
    load_dotenv = None  # type: ignore[assignment]

if load_dotenv is not None:
    load_dotenv()

DATA_FILE = Path(os.getenv("DATA_FILE", "./data.json"))


def _new_object_id_like() -> str:
    # 24 hex chars, like Mongo ObjectId, but purely local.
    return secrets.token_hex(12)


def _matches_filter(doc: Dict[str, Any], filter_doc: Dict[str, Any]) -> bool:
    if not filter_doc:
        return True
    for k, v in filter_doc.items():
        if doc.get(k) != v:
            return False
    return True


def _default_store() -> Dict[str, Any]:
    return {"properties": [], "users": []}


class _JsonFileStore:
    def __init__(self, path: Path) -> None:
        self._path = path
        self._lock = asyncio.Lock()

    async def read(self) -> Dict[str, Any]:
        async with self._lock:
            def _read_sync() -> Dict[str, Any]:
                if not self._path.exists():
                    return _default_store()
                raw = self._path.read_text(encoding="utf-8").strip()
                if not raw:
                    return _default_store()
                data = json.loads(raw)
                if not isinstance(data, dict):
                    return _default_store()
                data.setdefault("properties", [])
                data.setdefault("users", [])
                return data

            return await asyncio.to_thread(_read_sync)

    async def write(self, data: Dict[str, Any]) -> None:
        async with self._lock:
            payload = json.dumps(data, indent=2, sort_keys=False) + "\n"

            def _write_sync() -> None:
                self._path.parent.mkdir(parents=True, exist_ok=True)
                tmp = self._path.with_suffix(self._path.suffix + ".tmp")
                tmp.write_text(payload, encoding="utf-8")
                tmp.replace(self._path)

            await asyncio.to_thread(_write_sync)


class _Cursor:
    def __init__(self, store: "_JsonFileStore", key: str, filter_doc: Dict[str, Any]) -> None:
        self._store = store
        self._key = key
        self._filter_doc = filter_doc

    async def to_list(self, length: int = 1000) -> List[Dict[str, Any]]:
        data = await self._store.read()
        docs = data.get(self._key, [])
        if not isinstance(docs, list):
            return []
        out: List[Dict[str, Any]] = []
        for d in docs:
            if isinstance(d, dict) and _matches_filter(d, self._filter_doc):
                out.append(d)
                if len(out) >= length:
                    break
        return out


@dataclass(frozen=True)
class _InsertOneResult:
    inserted_id: str


class _JsonCollection:
    def __init__(self, store: _JsonFileStore, key: str) -> None:
        self._store = store
        self._key = key

    def find(self, filter_doc: Dict[str, Any]) -> _Cursor:
        return _Cursor(self._store, self._key, filter_doc)

    async def find_one(self, filter_doc: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        data = await self._store.read()
        docs = data.get(self._key, [])
        if not isinstance(docs, list):
            return None
        for d in docs:
            if isinstance(d, dict) and _matches_filter(d, filter_doc):
                return d
        return None

    async def insert_one(self, doc: Dict[str, Any]) -> _InsertOneResult:
        data = await self._store.read()
        docs = data.get(self._key, [])
        if not isinstance(docs, list):
            docs = []
            data[self._key] = docs

        to_insert = dict(doc)
        inserted_id = str(to_insert.get("_id") or _new_object_id_like()).lower()
        to_insert["_id"] = inserted_id
        docs.append(to_insert)
        await self._store.write(data)
        return _InsertOneResult(inserted_id=inserted_id)


class _NoopClient:
    def close(self) -> None:
        return None


_store = _JsonFileStore(DATA_FILE)

client = _NoopClient()
properties_collection = _JsonCollection(_store, "properties")
users_collection = _JsonCollection(_store, "users")

