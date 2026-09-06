from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Import your existing logic
from git_logic import process_repo_optimal
from vector_db import create_embeddings_and_store
from chat_logic import get_chatbot_response
from main import check_if_repo_exists,get_repo_info

load_dotenv()

app = FastAPI()

# --- Data Models ---
class EmbedRequest(BaseModel):
    repo_url: str
    branch:str="main"

class ChatRequest(BaseModel):
    repo_id: str
    query: str

# --- Configuration ---
MONGO_URI = os.getenv("MONGODB_ATLAS_URI")
DB_NAME = "github_explorer"
COLLECTION_NAME = "code_chunks"

@app.get("/")
def home():
    return {"status": "RepoTalk AI Server is Running"}

@app.post("/ingest")
def ingest_repo(request: EmbedRequest):
    """
    Clones and embeds a repository.
    """
    try:
        repo_url = request.repo_url
        branch=request.branch
        
        # Validate repository size and safety
        issafe = get_repo_info(repo_url, branch)
         # [FIX] Generate ID including the branch
        parts = repo_url.rstrip("/").split("/")
        # Format: "owner/repo/branch"
        unique_repo_id = f"{parts[-2]}/{parts[-1].replace('.git', '')}/{branch}"

        # 1. Check if exists
        exists = check_if_repo_exists(unique_repo_id, MONGO_URI, DB_NAME, COLLECTION_NAME)
        if exists:
            return {"message": "Repo already indexed", "repo_id": unique_repo_id}

        # 2. Process
        chunks = process_repo_optimal(repo_url,unique_repo_id,branch)
        if not chunks:
            raise HTTPException(status_code=400, detail="Failed to process repo")
            
        # 3. Store
        create_embeddings_and_store(chunks, MONGO_URI, DB_NAME, COLLECTION_NAME)
        
        return {"message": "Ingestion successful", "repo_id": unique_repo_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat(request: ChatRequest):
    """
    Answers a question based on valid repo_id.
    """
    try:
        clean_repo_id = request.repo_id.replace(".git", "")
        answer, sources = get_chatbot_response(request.query, clean_repo_id)
        return {"answer": answer, "sources": sources}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)