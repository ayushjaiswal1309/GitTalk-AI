import os
import time
from datetime import datetime
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from pymongo import MongoClient

load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

def get_collection(connection_string, database_name, collection_name):
    client = MongoClient(connection_string)
    return client[database_name][collection_name]

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-2",
    google_api_key=GOOGLE_API_KEY  # <-- correct model name
)
