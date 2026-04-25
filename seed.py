import json
import os
import secrets
from pathlib import Path

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover
    load_dotenv = None  # type: ignore[assignment]


def _new_object_id_like() -> str:
    return secrets.token_hex(12)


def seed() -> None:
    if load_dotenv is not None:
        load_dotenv()
    data_file = Path(os.getenv("DATA_FILE", "./data.json"))
    data_file.parent.mkdir(parents=True, exist_ok=True)

    mock_properties = [
        {
            "_id": _new_object_id_like(),
            "address": "88 Pine Street, San Francisco, CA 94111",
            "price": 1250000.0,
            "total_tokens": 10000,
            "available_tokens": 7250,
            "apy_percentage": 7.8,
            "ipfs_image_cid": "bafybeigdyrzt3dummycidproperty01",
        },
        {
            "_id": _new_object_id_like(),
            "address": "2120 Ocean Ave, Santa Monica, CA 90405",
            "price": 1895000.0,
            "total_tokens": 15000,
            "available_tokens": 15000,
            "apy_percentage": 6.4,
            "ipfs_image_cid": "bafybeigdyrzt3dummycidproperty02",
        },
        {
            "_id": _new_object_id_like(),
            "address": "14 Bedford Row, New York, NY 10012",
            "price": 2450000.0,
            "total_tokens": 20000,
            "available_tokens": 4300,
            "apy_percentage": 8.2,
            "ipfs_image_cid": "bafybeigdyrzt3dummycidproperty03",
        },
    ]

    payload = {"properties": mock_properties, "users": []}
    data_file.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Seeded {len(mock_properties)} properties into '{data_file}'.")
    print("Property IDs:")
    for p in mock_properties:
        print(f"- {p['_id']}")


if __name__ == "__main__":
    seed()

