import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv('e:/Projects/Git-talk-main/Git-talk-main/app/.env')

MONGO_URI = os.getenv("MONGODB_ATLAS_URI")
DB_NAME = "github_explorer"
COLLECTION_NAME = "code_chunks"

client = MongoClient(MONGO_URI)
collection = client[DB_NAME][COLLECTION_NAME]

target_repo_id = "anandlavhale/Gharpan/main"

count = collection.count_documents({"repo_id": target_repo_id})
print(f"Total chunks in DB for {target_repo_id}: {count}")

