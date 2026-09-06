import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from pymongo import MongoClient

load_dotenv('e:/Projects/Git-talk-main/Git-talk-main/app/.env')

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
MONGO_URI = os.getenv("MONGODB_ATLAS_URI")
DB_NAME = "github_explorer"
COLLECTION_NAME = "code_chunks"

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-2",
    google_api_key=GOOGLE_API_KEY
)

client = MongoClient(MONGO_URI)
collection = client[DB_NAME][COLLECTION_NAME]

vector_store = MongoDBAtlasVectorSearch(
    collection=collection,
    embedding=embeddings,
    index_name="vector_index" 
)

target_repo_id = "anandlavhale/Gharpan/main"

docs = vector_store.similarity_search(
    "gharpan", 
    k=5, 
    pre_filter={"repo_id": {"$eq": target_repo_id}}
)

print(f"Docs found: {len(docs)}")
for doc in docs:
    print(doc.metadata)

