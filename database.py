import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient


load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "tokenization")


client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB_NAME]

properties_collection = db["properties"]
users_collection = db["users"]

