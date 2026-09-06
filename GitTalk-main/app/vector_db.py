import os
import time
from datetime import datetime
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from pymongo import MongoClient
from embedding import get_collection , embeddings

load_dotenv()
connection_string= os.getenv('MONGODB_ATLAS_URI')
database_name = "github_explorer"
collection_name = "code_chunks"
collection = get_collection(connection_string, database_name, collection_name)

vector_store = MongoDBAtlasVectorSearch(
            collection=collection,
            embedding=embeddings,
            index_name="autoembed_index" 
    )

        # Initialize Vector Store
def initialize_vector_store (collection_name , connection_string ,database_name):

    return vector_store 

def setup_ttl_index(connection_string, database_name, collection_name):
    """
    Creates a rule: Delete documents 48 hours (172800 seconds) after creation.
    """
    collection = get_collection(connection_string, database_name, collection_name)
    
    # CRITICAL: We index "metadata.created_at" because that's where we store the time
    collection.create_index("metadata.created_at", expireAfterSeconds=172800)
    print("TTL Index verified: Data will auto-delete after 48 hours of inactivity.")


def refresh_repo_timestamp(repo_id,connection_string, database_name, collection_name):
    """
    Resets the 'created_at' timer for all chunks in this repo.
    This prevents the data from being deleted while the user is active.
    """
    try:
        collection = get_collection(connection_string, database_name, collection_name)
        
        # Update ALL documents for this repo with the NEW time
        collection.update_many(
            {"repo_id": repo_id}, 
            {"$set": {"metadata.created_at": datetime.utcnow()}} 
        )
    except Exception as e:
        print(f"Failed to refresh timestamp: {e}")


def create_embeddings_and_store(chunks, connection_string, database_name, collection_name):
    try:
        # --- Add Timestamp for TTL ---
        current_time = datetime.utcnow()

        vector_store=initialize_vector_store(collection_name , connection_string ,database_name)

        for doc in chunks:
            # This field controls when the document dies
            doc.metadata["created_at"] = current_time

        # Process in Batches (Rate Limit Safety)
        batch_size = 20 
        total_chunks = len(chunks)

        print(f"Processing {total_chunks} chunks...")

        for i in range(0, total_chunks, batch_size):
            batch = chunks[i : i + batch_size]
            vector_store.add_documents(batch)
            print(f"Processed batch {i} to {i + len(batch)}...")
            
            # Sleep to respect Free Tier limits (15 RPM)
            if i + batch_size < total_chunks:
                time.sleep(4)

        # Ensure the auto-delete rule is active
        setup_ttl_index(connection_string, database_name, collection_name)
        
        print("Success! Code stored.")
        return vector_store

    except Exception as e:
        print(f" Error in Embedding: {e}")
        return None
    