from langchain.chat_models import init_chat_model
from dotenv import load_dotenv

load_dotenv()

llm = init_chat_model(model="google_genai:gemini-3.5-flash")
 
