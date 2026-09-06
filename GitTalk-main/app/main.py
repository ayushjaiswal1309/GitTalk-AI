import os
from dotenv import load_dotenv
import requests
from git_logic import process_repo_optimal
from vector_db import create_embeddings_and_store
from chat_logic import get_chatbot_response
from embedding import get_collection

load_dotenv()
# print("✓ Environment variables loaded")
def get_repo_info(repo_url, branch):
    try:
        parts=repo_url.rstrip("/").split("/")
        owner=parts[-2]
        repo_name=parts[-1].replace(".git","")
        api_url=f"https://api.github.com/repos/{owner}/{repo_name}"
        response=requests.get(api_url)

        if response.status_code==200:
            data=response.json()
            size_kb=data.get("size",0)
            size_mb=size_kb/1024
            print(f"Repository: {owner}/{repo_name}")
            print(f"Size: {size_mb:.2f} MB")
          
            max_size_mb = 50
            if(size_mb>max_size_mb):
                print(f"Repo too large (> {max_size_mb} MB).")
                return False
            else:
                print("Size is within limits.")
                return True
        else:
            print(f"Error checking repo: {response.status_code} - {response.reason}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False
    
def check_if_repo_exists(repo_id, connection_string, database_name, collection_name):
    """
    Returns True if the repo is already indexed in MongoDB.
    """
    collection = get_collection(connection_string, database_name, collection_name)
    # We look for just ONE document with this repo_id to confirm existence
    existing_doc = collection.find_one({"repo_id": repo_id})
    return True if existing_doc else False

def run_ingestion_and_chat():
    # --- CONFIGURATION ---
    REPO_URL = "https://github.com/Vedant222005/Campus-Kudos" # Change this to any repo
    BRANCH = "main"
    
    MONGO_URI = os.getenv("MONGODB_ATLAS_URI")
    
    # Check if MongoDB URI exists
    if not MONGO_URI:
        print("❌ ERROR: MONGODB_ATLAS_URI not found in .env file!")
        print("⚙️  Please create a .env file with: MONGODB_ATLAS_URI=your_mongodb_connection_string")
        return
    
    DB_NAME = "github_explorer"
    COLLECTION_NAME = "code_chunks"

    # Generate Unique ID
    parts = REPO_URL.rstrip("/").split("/")
    REPO_ID = f"{parts[-2]}/{parts[-1].replace('.git', '')}"

    print(f"🚀 Starting System for: {REPO_ID}")

    # --- PHASE 1: INGESTION ---
    print("[DEBUG] Checking if repo exists in DB...")
    already_exists = check_if_repo_exists(REPO_ID, MONGO_URI, DB_NAME, COLLECTION_NAME)
    print(f"[DEBUG] Repo exists? {already_exists}")

    if already_exists:
        print(f"⚡ Repo '{REPO_ID}' found in cache. Skipping ingestion.")
    else:
        print(f"🆕 Repo not found. Cloning and processing...")
        print("[DEBUG] Calling process_repo_optimal...")
        chunks = process_repo_optimal(REPO_URL, BRANCH)
        print(f"[DEBUG] Chunks returned: {type(chunks)}")
        if chunks:
            print("[DEBUG] Calling create_embeddings_and_store...")
            create_embeddings_and_store(chunks, MONGO_URI, DB_NAME, COLLECTION_NAME)
            print("[DEBUG] Embeddings stored.")
        else:
            print("❌ Processing failed or empty repo.")
            return

    # --- PHASE 2: CHAT ---
    print(f"\n💬 Chat session active for: {REPO_ID}")
    print("Type 'exit' to quit.\n")
    
    while True:
        query = input("You: ")
        if query.lower() in ['exit', 'quit']:
            break
            
        answer = get_chatbot_response(query, REPO_ID)
        print(f"\n🤖 AI: {answer}\n")

if __name__ == "__main__":
    try:
        run_ingestion_and_chat()
    except Exception as e:
        print(f"\n❌ FATAL ERROR: {str(e)}")
        print("\n📋 Full Traceback:")
        traceback.print_exc()
        sys.exit(1)

