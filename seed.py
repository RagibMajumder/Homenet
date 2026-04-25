import asyncio
import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient


async def seed() -> None:
    load_dotenv()

    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    db_name = os.getenv("MONGO_DB_NAME", "tokenization")

    client = AsyncIOMotorClient(mongo_uri)
    try:
        await client.drop_database(db_name)
        db = client[db_name]
        properties = db["properties"]

        mock_properties = [
            {
                "address": "88 Pine Street, San Francisco, CA 94111",
                "price": 1250000.0,
                "total_tokens": 10000,
                "available_tokens": 7250,
                "apy_percentage": 7.8,
                "ipfs_image_cid": "bafybeigdyrzt3dummycidproperty01",
            },
            {
                "address": "2120 Ocean Ave, Santa Monica, CA 90405",
                "price": 1895000.0,
                "total_tokens": 15000,
                "available_tokens": 15000,
                "apy_percentage": 6.4,
                "ipfs_image_cid": "bafybeigdyrzt3dummycidproperty02",
            },
            {
                "address": "14 Bedford Row, New York, NY 10012",
                "price": 2450000.0,
                "total_tokens": 20000,
                "available_tokens": 4300,
                "apy_percentage": 8.2,
                "ipfs_image_cid": "bafybeigdyrzt3dummycidproperty03",
            },
        ]

        await properties.insert_many(mock_properties)
        print(f"Seeded {len(mock_properties)} properties into DB '{db_name}'.")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(seed())

