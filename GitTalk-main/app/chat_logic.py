import os
from datetime import datetime
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from pymongo import MongoClient
from langchain_core.prompts import ChatPromptTemplate , PromptTemplate
from langchain.chat_models import init_chat_model
from vector_db import refresh_repo_timestamp
from embedding import embeddings
from vector_db import initialize_vector_store
from model import llm
from prompt_template import chat_template

load_dotenv()

connection_string= os.getenv('MONGODB_ATLAS_URI')
database_name = "github_explorer"
collection_name = "code_chunks"


def get_chatbot_response(user_query, target_repo_id):
    try:
        refresh_repo_timestamp(
            target_repo_id,
            connection_string,
            database_name,
            collection_name
        )
        print("repo timestamp refreshed")
        vector_store = initialize_vector_store(
            collection_name,
            connection_string,
            database_name
        )
        print("vector store initialized")

        retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={
                "k": 5,
                "pre_filter": {"repo_id": {"$eq": target_repo_id}}
            }
        )
        
        docs = retriever.invoke(user_query)
        
        
        context_text = "\n\n".join(doc.page_content for doc in docs)

        prompt = chat_template.format(
            target_repo_id=target_repo_id,
            context_text=context_text,
            user_query=user_query
        )

        # Extract unique sources
        sources = {doc.metadata.get("file_path", "Unknown File") for doc in docs}
        
        response = llm.invoke(prompt)
        content = response.content
        if isinstance(content, list):
            content = "".join([block.get("text", "") if isinstance(block, dict) else str(block) for block in content])
        elif not isinstance(content, str):
            content = str(content)
            
        return content, list(sources)

    except Exception as e:
        print(f"Error: {e}")
        return "Sorry, I encountered an error.", []
