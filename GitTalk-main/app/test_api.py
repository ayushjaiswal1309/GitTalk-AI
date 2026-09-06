import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

load_dotenv('e:/Projects/Git-talk-main/Git-talk-main/app/.env')

try:
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=os.getenv('GOOGLE_API_KEY')
    )
    result = embeddings.embed_query("hello")
    print("Success 001. Length:", len(result))
except Exception as e:
    print(e)
