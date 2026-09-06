# 🎓 GitTalk – Complete Interview Preparation Guide
### Your Personal Mentor's Breakdown (Zero to Hero)

---

# ✅ STEP 1: PROJECT OVERVIEW (Start Here)

## What is GitTalk / RepoTalk?

**In one sentence:**
> GitTalk is an AI-powered chatbot that lets you have a conversation with any GitHub repository's source code — just paste a GitHub link, and you can ask questions like "How does authentication work?" or "Where is the database connected?"

**Real-world analogy:**
Imagine you just joined a new company and inherited a massive codebase written by someone who no longer works there. Normally, you'd spend weeks reading thousands of lines of code to understand it.

GitTalk is like having that **original developer sitting next to you** — you just ask questions in plain English, and they answer from the code itself.

---

## What problem does it solve?

- Reading and understanding a large GitHub codebase is **time-consuming and difficult**.
- GitHub has no built-in "ask questions about this code" feature.
- Developers often waste hours just searching for *where* something is implemented.

GitTalk solves this by:
1. Downloading the repo's code automatically
2. Making the AI understand the code
3. Letting you ask questions in plain English

---

## Who would use it?

- Developers who joined a new project and need to understand an unfamiliar codebase
- Open-source contributors exploring a repo before contributing
- Students learning from real-world GitHub projects
- Code reviewers who want quick answers

---

## Main Features

| Feature | What it does |
|---|---|
| 🔐 User Auth | Register / Login / Logout with secure sessions |
| 🔗 Repo Ingestion | Paste any GitHub URL → AI reads and understands all the code |
| 💬 AI Chat | Ask plain-English questions about the code |
| 📜 Chat History | Your previous conversations are saved per repo |
| 🗂️ Sidebar | See all repos you've previously chatted about |
| 📂 Referenced Files | AI shows *which files* it used to answer your question |

---

## User Journey (End-to-End Story)

```
1. User visits the web app
2. User registers/logs in
3. User pastes a GitHub repo URL (e.g., https://github.com/facebook/react)
4. App clones the repo and reads all code files
5. Code is converted into a format AI can search (embeddings)
6. Code chunks are stored in MongoDB Atlas (cloud database)
7. User types a question: "How does the render function work?"
8. AI searches the stored code for relevant pieces
9. AI reads those pieces and generates a human answer
10. Answer appears in the chat with the files it referenced
11. Conversation is saved so user can come back later
```

---

# ✅ STEP 2: TECH STACK – Every Technology Explained

## 🟨 JavaScript / Node.js (Backend)

**What is it?**
JavaScript is a programming language. Node.js lets you run JavaScript on the server (normally JS only runs in browsers).

**Why is it used here?**
The "middle" server (authentication, chat history, routing) is built with Node.js. It handles user login, saves chat history, and acts as a **gateway** between the frontend and the Python AI server.

**Where in code?** → `backend/server.js`, `backend/controllers/`

---

## ⚛️ React (Frontend)

**What is it?**
React is a JavaScript library for building interactive user interfaces. Instead of reloading the whole page every time something changes, React only updates the part that changed.

**Why is it used here?**
It powers the entire visual interface — the login page, dashboard, chat window, sidebar. It makes the app feel fast and smooth.

**Where in code?** → `Frontend/src/` — all `.jsx` files

---

## ⚡ Vite (Frontend Build Tool)

**What is it?**
Vite is a tool that helps you develop and build React apps super fast. Think of it as the "compiler" that turns your React code into something browsers understand.

**Where in code?** → `Frontend/vite.config.js`

---

## 🌐 Express.js (Node.js Framework)

**What is it?**
Express is a framework on top of Node.js that makes it easy to create API endpoints (URLs that the frontend can call to get data).

**Why used here?**
The Node backend (`backend/server.js`) uses Express to define routes like `/api/auth/login`, `/api/chat/save`, etc.

**Without it:** You'd have to write much more boilerplate code to handle HTTP requests.

---

## 🐍 Python + FastAPI (AI Server)

**What is Python?**
A programming language. Very popular for AI and data science because of its rich ecosystem of libraries.

**What is FastAPI?**
A Python framework (like Express but for Python) that creates fast API endpoints.

**Why used here?**
All the AI work — reading the GitHub repo, creating embeddings, searching the vector database — happens in Python. It exposes two endpoints:
- `POST /ingest` — Clone and embed a repo
- `POST /chat` — Answer a question about a repo

**Where in code?** → `app/server.py`

---

## 🔗 LangChain

**What is it?**
LangChain is a Python library that makes it easy to build applications that use Large Language Models (AI). It provides ready-made "building blocks" like loaders, splitters, embeddings, vector stores, and prompt templates.

**Why used here?**
Without LangChain, you'd have to write all the code to clone repos, split code into chunks, send them to AI for embedding, store them in MongoDB, and search them — all from scratch. LangChain provides all these as simple function calls.

**Where in code?**
- `git_logic.py` → Uses `GitLoader`, `RecursiveCharacterTextSplitter`
- `vector_db.py` → Uses `MongoDBAtlasVectorSearch`
- `chat_logic.py` → Uses retriever, `ChatPromptTemplate`
- `model.py` → Uses `init_chat_model`

---

## 🤖 Google Gemini (LLM – Large Language Model)

**What is an LLM?**
An LLM is a very advanced AI that understands and generates human language. ChatGPT, Gemini, and Claude are all LLMs.

**What is Gemini?**
Google's AI model (similar to ChatGPT). This project uses:
- **`gemini-embedding-2`** → To convert code into numbers (embeddings)
- **`gemini-3.5-flash`** → To actually answer the user's questions

**Why used here?**
Gemini is the "brain" — it reads relevant code chunks and generates human-readable answers.

**Where in code?**
- `embedding.py` → `GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-2")`
- `model.py` → `init_chat_model("google_genai:gemini-3.5-flash")`

---

## 📦 MongoDB Atlas (Cloud Database)

**What is it?**
MongoDB is a database that stores data as JSON-like documents (instead of tables like Excel). Atlas is the cloud-hosted version — you don't need to install anything, it runs on Google Cloud/AWS.

**This project uses MongoDB for TWO different purposes:**

| Purpose | Database | What's stored |
|---|---|---|
| User accounts + chat history | Node backend connects to it | Users, ChatHistory |
| Code embeddings (Vector Search) | Python connects to it | Code chunks with their vector embeddings |

**Where in code?**
- `backend/server.js` → `mongoose.connect(process.env.MONGO_URI)`
- `embedding.py` → `MongoClient(connection_string)`

---

## 🔢 Embeddings – The Core Concept

**What are Embeddings? (Super Simple)**

Computers cannot understand words. They only understand numbers.

An **embedding** converts a piece of text into a list of ~768 numbers (called a vector). The magical thing is: **texts with similar meaning get similar numbers.**

Example:
```
"function that sorts a list" → [0.23, -0.87, 0.44, ...]
"method to arrange items"   → [0.24, -0.85, 0.43, ...]  ← similar!
"recipe for chocolate cake" → [-0.91, 0.33, -0.12, ...] ← very different
```

So when you ask "how does sorting work?", the system converts your question to numbers, then finds code chunks whose numbers are closest → those are the most relevant code pieces.

**Where in code?**
- `embedding.py` → `GoogleGenerativeAIEmbeddings` creates the embedding model
- `vector_db.py` → `vector_store.add_documents(batch)` stores chunks WITH their embeddings
- `chat_logic.py` → `retriever.invoke(user_query)` searches by embedding similarity

---

## 🗃️ Vector Search / Vector Database

**What is it?**
A special type of database search that finds documents by **similarity of meaning**, not by exact keyword match.

**Normal search:** "Show me documents containing the word 'sort'"
**Vector search:** "Show me documents about sorting things, even if they don't use that exact word"

MongoDB Atlas has a built-in **Vector Search** feature called `autoembed_index`.

**Why is this important?**
Users won't always use the exact same words as the code. They might ask "how does login work?" but the code uses "authenticate user". Vector search finds it anyway.

**Where in code?**
- `vector_db.py` → `MongoDBAtlasVectorSearch(..., index_name="autoembed_index")`
- `chat_logic.py` → `search_type="similarity", search_kwargs={"k": 5}`

---

## 🔄 RAG – Retrieval-Augmented Generation

**This is the MOST important concept. Understand this well.**

**The Problem without RAG:**
If you ask Gemini "How does authentication work in this random GitHub repo?", Gemini has no idea — it was trained on public internet data, not your specific private repo.

**What RAG does:**
RAG is a technique where you:
1. **Retrieve** relevant documents from your own database (the code chunks)
2. **Augment** the AI prompt with those documents
3. **Generate** an answer based on ONLY those documents

**The flow:**
```
User question: "How does login work?"
         ↓
Convert question to embedding (numbers)
         ↓
Search MongoDB for the 5 most similar code chunks
         ↓
Take those 5 chunks and put them into the AI prompt:
"Here is some code. Answer the question based ONLY on this code."
         ↓
Gemini reads the code chunks and answers
         ↓
Answer shown to user + files referenced
```

**Where in code?**
- `chat_logic.py` → The entire `get_chatbot_response()` function IS the RAG pipeline
- `prompt_template.py` → The system prompt tells Gemini to use ONLY the provided context

---

## 🔐 JWT – JSON Web Token (Authentication)

**What is it?**
When a user logs in, the server creates a "ticket" (JWT token) and gives it to the browser. On every future request, the browser shows this ticket to prove it's the logged-in user.

**Real-world analogy:** Like a wristband at a concert. Once you're verified at the entrance, you show the wristband everywhere and don't need to show your ID again.

**Where in code?**
- `authController.js` → `jwt.sign({id: user._id}, process.env.JWT_SECRET)` — creates the token
- `authMiddleware.js` → `jwt.verify(token, process.env.JWT_SECRET)` — checks the token
- Token is stored as an **HTTP-only cookie** (browser automatically sends it on every request)

---

## 🍪 bcrypt (Password Hashing)

**What is it?**
bcrypt takes a plain password and converts it into a scrambled string that cannot be reversed.

**Why?** If the database is ever hacked, passwords are not exposed.

**Where in code?**
- `authController.js` → `bcrypt.hash(password, 10)` when registering
- `authController.js` → `bcrypt.compare(password, user.password)` when logging in

---

## 🏗️ GitLoader (LangChain)

**What is it?**
A LangChain tool that clones a GitHub repository locally and reads all the code files, converting them into LangChain `Document` objects.

**Where in code?**
- `git_logic.py` → `GitLoader(clone_url=repo_url, repo_path=local_path, branch=branch)`

---

## ✂️ RecursiveCharacterTextSplitter

**What is it?**
Code files can be thousands of lines long. AI models have a limit on how much text they can process at once (called "context window").

This splitter breaks large files into smaller **chunks** (1000 characters each, with 150 characters of overlap).

**Why overlap?** So that if important information is at the boundary of two chunks, neither chunk loses it entirely.

**Where in code?**
- `git_logic.py` → `RecursiveCharacterTextSplitter.from_language(language=lang, chunk_size=1000, chunk_overlap=150)`

---

## ⏱️ TTL Index (Auto-Delete)

**What is it?**
TTL = "Time To Live". MongoDB can automatically delete documents after a certain time.

**Why used here?**
Storing code embeddings costs money. The project automatically deletes repo data after 48 hours of inactivity. If the user comes back and chats again, the `created_at` timestamp is refreshed (so it won't be deleted while they're using it).

**Where in code?**
- `vector_db.py` → `setup_ttl_index()` → `expireAfterSeconds=172800` (48 hours)
- `vector_db.py` → `refresh_repo_timestamp()` → resets the timer when user chats

---

## 🐳 Docker (Deployment)

**What is it?**
Docker packages your entire application (code + all dependencies) into a "container" — a mini isolated computer that runs the same way everywhere.

**Why used here?**
This project has both Python AND Node.js servers running simultaneously. Docker bundles both into one deployable unit.

**Where in code?**
- `Dockerfile` — Instructions to build the container
- `start.sh` — Starts Python server first (port 8000), then Node.js server (port 5001)

---

## 🔗 Axios

**What is it?**
A JavaScript library that makes it easy to send HTTP requests (call APIs).

**Used in TWO places:**
1. **Frontend** (`api.js`) → React calls the Node backend using Axios
2. **Node backend** (`chatController.js`) → Node calls the Python FastAPI server using Axios

---

## 📝 Mongoose

**What is it?**
Mongoose is a Node.js library that makes working with MongoDB easier. It lets you define "schemas" (the structure of your data) as JavaScript objects.

**Where in code?**
- `backend/models/user.js` → Defines what a User document looks like
- `backend/models/chat.js` → Defines what a ChatHistory document looks like

---

## 🎨 Tailwind CSS

**What is it?**
A CSS framework where instead of writing separate CSS files, you add pre-built style classes directly in your HTML/JSX.

Example: `className="text-white bg-blue-500 p-4 rounded-xl"` instead of writing CSS from scratch.

**Where in code?** → Throughout all `.jsx` files, `tailwind.config.js`

---

# ✅ STEP 3: ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
│                                                                 │
│  ┌──────────┐    ┌───────────────┐    ┌──────────────────────┐  │
│  │ Login.jsx│    │  Dashboard.jsx│    │  ChatInterface.jsx   │  │
│  │          │    │ (paste URL)   │    │  (ask questions)     │  │
│  └──────────┘    └───────────────┘    └──────────────────────┘  │
│          React Frontend (Vite) - Port 5173 (dev)                │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP (Axios) with JWT cookie
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              NODE.JS EXPRESS BACKEND - Port 5001                │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │   /api/auth routes  │    │       /api/chat routes          │ │
│  │  - POST /register   │    │  - POST /ingest (proxy)         │ │
│  │  - POST /login      │    │  - POST /save (get AI answer    │ │
│  │  - POST /logout     │    │    + save to DB)                │ │
│  │  - GET  /me         │    │  - GET  /history                │ │
│  └─────────────────────┘    │  - GET  /user-chats             │ │
│                             └──────────────┬────────────────── ┘ │
│                                            │ Axios HTTP call      │
└────────────────────────────────────────────┼─────────────────────┘
                                             │                       
        ┌────────────────────────────────────┤
        │                                    │
        ▼                                    ▼
┌───────────────────┐            ┌──────────────────────────────┐
│  MONGODB ATLAS    │            │   PYTHON FASTAPI SERVER      │
│  (Users + Chats)  │            │   Port 8000                  │
│                   │            │                              │
│  Collections:     │            │  POST /ingest:               │
│  - users          │            │    git_logic.py → Clone repo │
│  - chathistory    │            │    vector_db.py → Embed code │
└───────────────────┘            │                              │
                                 │  POST /chat:                 │
                                 │    chat_logic.py → RAG       │
                                 │    Gemini AI → Answer        │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │  MONGODB ATLAS               │
                                 │  (Code Embeddings)           │
                                 │                              │
                                 │  Collection: code_chunks     │
                                 │  - text content of code      │
                                 │  - embedding (vector)        │
                                 │  - repo_id, file_path        │
                                 │  - created_at (TTL)          │
                                 └──────────────────────────────┘
```

> **Important note:** The project actually uses **two separate MongoDB connections** — one for the Node backend (users/chat history) and one for the Python backend (code embeddings). They could be the same Atlas cluster but are logically separate.

---

# ✅ STEP 4: FOLDER STRUCTURE – Every File Explained

```
GitTalk-main/
│
├── 📁 Frontend/                  ← React user interface
│   └── src/
│       ├── main.jsx              ← Entry point, mounts React app
│       ├── App.jsx               ← Router: decides which page to show
│       ├── api.js                ← All HTTP calls to Node backend
│       ├── index.css             ← Global CSS styles
│       └── Components/
│           ├── Login.jsx         ← Login + Register page
│           ├── Dashboard.jsx     ← Paste GitHub URL page
│           ├── ChatInterface.jsx ← Main chat window
│           └── Sidebar.jsx       ← Left panel with chat history
│
├── 📁 backend/                   ← Node.js Express server
│   ├── server.js                 ← Main server entry point
│   ├── routes/
│   │   ├── authRoutes.js         ← /api/auth/* URL definitions
│   │   └── chatRoutes.js         ← /api/chat/* URL definitions
│   ├── controllers/
│   │   ├── authController.js     ← register, login, logout, getMe
│   │   └── chatController.js     ← saveMessage, getHistory, ingestRepo
│   ├── middleware/
│   │   └── authMiddleware.js     ← JWT token verification
│   └── models/
│       ├── user.js               ← MongoDB User schema
│       └── chat.js               ← MongoDB ChatHistory schema
│
├── 📁 app/                       ← Python FastAPI AI server
│   ├── server.py                 ← FastAPI entry point (routes: /ingest, /chat)
│   ├── main.py                   ← Original CLI test script (not used in prod)
│   ├── git_logic.py              ← Clone repo + split code into chunks
│   ├── embedding.py              ← Google Gemini embedding model setup
│   ├── vector_db.py              ← MongoDB vector store operations
│   ├── chat_logic.py             ← RAG pipeline: search + ask Gemini
│   ├── model.py                  ← Gemini LLM model initialization
│   ├── prompt_template.py        ← System prompt template for Gemini
│   └── requirements.txt          ← Python package dependencies
│
├── Dockerfile                    ← Docker container build instructions
├── start.sh                      ← Starts Python server then Node server
└── package.json                  ← Root-level scripts
```

---

# ✅ STEP 5: COMPLETE APPLICATION FLOW (TRACE)

## Flow A: User Logs In

```
1. User fills login form in Login.jsx
         ↓
2. Login.jsx calls: api.login({ email, password })
   → api.js: API.post('/auth/login', data)
         ↓
3. Node backend receives: POST /api/auth/login
   → authRoutes.js routes to authController.js → login()
         ↓
4. login() in authController.js:
   - Finds user in MongoDB by email
   - Compares bcrypt hash
   - Creates JWT: jwt.sign({id: user._id}, JWT_SECRET)
   - Stores JWT in HTTP-only cookie
         ↓
5. Response: { user: {id, username, email} }
         ↓
6. App.jsx: setUser(data) → React re-renders → redirect to Dashboard
```

---

## Flow B: User Ingests a Repository (Most Important!)

```
1. User pastes GitHub URL in Dashboard.jsx
   e.g., "https://github.com/facebook/react"
         ↓
2. handleStartChat() in Dashboard.jsx:
   api.ingestRepo({ repoUrl: githubUrl, branch: "main" })
   → api.js: API.post('/chat/ingest', data)
         ↓
3. Node backend: POST /api/chat/ingest
   → chatRoutes.js → verifyToken middleware → ingestRepo() in chatController.js
         ↓
4. ingestRepo() in chatController.js:
   axios.post('http://127.0.0.1:8000/ingest', { repo_url, branch })
   → Calls Python FastAPI server
         ↓
5. Python FastAPI: POST /ingest in server.py → ingest_repo()
   a. get_repo_info() → checks repo size via GitHub API (max 50MB)
   b. check_if_repo_exists() → checks if already in MongoDB
   c. If NOT exists:
      → process_repo_optimal() in git_logic.py:
         - GitLoader clones the repo to temp_repos/ folder
         - Filters only: .py, .js, .ts, .java, .cpp, .go, .md files
         - RecursiveCharacterTextSplitter splits each file into chunks
           (1000 chars each, 150 overlap)
         - Adds metadata: repo_id, file_name to each chunk
         - Deletes temp folder (clean_dir)
         - Returns list of chunks (e.g., 500 chunks)
      → create_embeddings_and_store() in vector_db.py:
         - Adds created_at timestamp to each chunk (for TTL)
         - Sends chunks in batches of 20 to Gemini embedding API
         - Each chunk → list of ~768 numbers (embedding)
         - Stores chunk text + embedding in MongoDB code_chunks collection
         - Sleeps 4 seconds between batches (rate limit safety)
         - Calls setup_ttl_index() to ensure auto-delete after 48h
         ↓
6. Returns: { message: "Ingestion successful", repo_id: "facebook/react/main" }
         ↓
7. Dashboard.jsx navigates to: /chat/facebook/react/main
```

---

## Flow C: User Asks a Question

```
1. User types "How does the rendering work?" in ChatInterface.jsx
         ↓
2. handleSendMessage() in ChatInterface.jsx:
   - Immediately shows user message in UI (optimistic update)
   api.saveMessage(repoId, { userQuery: "How does the rendering work?" })
   → api.js: API.post('/chat/save', { repoId, userQuery })
         ↓
3. Node backend: POST /api/chat/save
   → chatRoutes.js → verifyToken → saveMessage() in chatController.js
         ↓
4. saveMessage() in chatController.js:
   Step 1: axios.post('http://127.0.0.1:8000/chat', { repo_id, query })
         ↓
5. Python FastAPI: POST /chat in server.py → chat()
   → get_chatbot_response(query, repo_id) in chat_logic.py:

   a. refresh_repo_timestamp() → resets 48h timer so data isn't deleted
   
   b. initialize_vector_store() → connects to MongoDB vector search
   
   c. retriever = vector_store.as_retriever(
        search_type="similarity",
        k=5,  ← top 5 most relevant chunks
        pre_filter: { repo_id: "facebook/react/main" }  ← only THIS repo
      )
   
   d. docs = retriever.invoke("How does the rendering work?")
      → Converts question to embedding (numbers)
      → MongoDB Atlas finds 5 most similar code chunks
   
   e. context_text = join all 5 chunks' content
   
   f. prompt = chat_template.format(
        target_repo_id=repo_id,
        context_text=context_text,  ← the 5 relevant code pieces
        user_query="How does the rendering work?"
      )
      (System prompt: "You are a Senior Software Engineer. Answer ONLY
       based on the context provided below...")
   
   g. response = llm.invoke(prompt)
      → Gemini reads the prompt + code context → generates answer
   
   h. sources = set of file_paths from the 5 chunks
   
   i. Returns: (answer_text, [list of source files])
         ↓
6. Back in saveMessage() (Node):
   Step 2: ChatHistory.create({
     userId: req.user.id,
     repoId,
     userQuery,
     botAnswer,
     referencedFiles: botSources
   }) → Saved to MongoDB
         ↓
7. Returns: { botAnswer, referencedFiles } to frontend
         ↓
8. ChatInterface.jsx:
   - Adds AI message to state
   - Typewriter effect animates the text character by character (5ms/char)
   - Shows "Referenced Files" section below the answer
```

---

# ✅ STEP 6: FILE-BY-FILE CODE EXPLANATION

## 📄 `app/git_logic.py`

**Why it exists:** To clone a GitHub repo and break its code into bite-sized chunks for AI processing.

### `process_repo_optimal(repo_url, unique_repo_id, branch)`
- **Input:** GitHub URL, unique ID, branch name
- **Output:** List of `Document` objects (code chunks with metadata)
- **Steps:**
  1. Creates a temp folder path like `temp_repos/facebook_react`
  2. Cleans it if it already exists
  3. Uses `GitLoader` to clone the repo (only keeps .py, .js, .ts, .java, .cpp, .go, .md files)
  4. Falls back to "master" branch if "main" doesn't exist
  5. Attaches `repo_id` and `file_name` to each file's metadata
  6. Splits each file into 1000-character chunks with 150-character overlap
  7. Returns all chunks, then deletes the temp folder

---

## 📄 `app/embedding.py`

**Why it exists:** Centralizes the setup of the embedding model and MongoDB connection.

- `get_collection()` → Connects to MongoDB and returns a specific collection
- `embeddings` → A global Gemini embedding model instance (reused everywhere)

---

## 📄 `app/vector_db.py`

**Why it exists:** Manages how code chunks are stored in and retrieved from MongoDB with vector search.

### Key functions:
- `create_embeddings_and_store()` → Batch-embeds chunks and stores them in MongoDB
- `setup_ttl_index()` → Sets up auto-delete rule (48 hours)
- `refresh_repo_timestamp()` → Resets the 48h timer when user is active
- `initialize_vector_store()` → Returns a connected `MongoDBAtlasVectorSearch` object

---

## 📄 `app/chat_logic.py`

**Why it exists:** This is the heart of the AI — the complete RAG pipeline.

### `get_chatbot_response(user_query, target_repo_id)`
- **Input:** User's question, repo ID
- **Output:** (AI answer string, list of source file paths)
- **Steps:**
  1. Refresh timestamp (keep data alive)
  2. Set up vector store connection
  3. Create retriever (searches by similarity, returns top 5 results, filtered to this repo only)
  4. Search for relevant code chunks
  5. Combine chunks into one context string
  6. Format prompt with context
  7. Send to Gemini → get response
  8. Extract source files
  9. Return answer + sources

---

## 📄 `app/prompt_template.py`

**Why it exists:** Defines the exact instructions given to Gemini before it answers.

Key instructions in the system prompt:
- "You are a helpful Senior Software Engineer"
- "Answer ONLY using the code context provided"
- "Mirror the user's tone (formal/casual)"
- "If you can't find it, say so honestly"
- "Don't list the files at the end — the system shows sources separately"

---

## 📄 `app/model.py`

**Why it exists:** Single place to initialize the LLM. If you ever want to switch from Gemini to GPT-4, you change it here only.

```python
llm = init_chat_model(model="google_genai:gemini-3.5-flash")
```

---

## 📄 `app/server.py`

**Why it exists:** The FastAPI HTTP server. It receives requests from Node.js and calls the right Python functions.

### Two endpoints:
- `POST /ingest` → Validates repo size → checks cache → clones + embeds
- `POST /chat` → Gets AI answer → returns answer + sources

---

## 📄 `backend/server.js`

**Why it exists:** Main Node.js server. Sets up Express, connects to MongoDB, registers routes, serves the built React frontend.

Key setup:
- `cors` → Allows frontend to call the backend
- `cookieParser` → Reads JWT from cookies
- `mongoose.connect()` → Connects to MongoDB
- `express.static(frontendDistPath)` → Serves the built React app as static files in production

---

## 📄 `backend/controllers/authController.js`

**Why it exists:** Handles all user authentication logic.

- `register()` → Creates new user with hashed password
- `login()` → Verifies credentials, creates JWT cookie
- `logout()` → Clears the JWT cookie
- `getMe()` → Returns current logged-in user info

---

## 📄 `backend/controllers/chatController.js`

**Why it exists:** Handles all chat operations.

- `ingestRepo()` → Proxies the ingest request to Python
- `saveMessage()` → Gets AI answer from Python, saves to MongoDB, returns to frontend
- `getChatHistory()` → Fetches all messages for a user + repo
- `getUserChats()` → Uses MongoDB aggregation to list all repos the user has chatted about

---

## 📄 `backend/middleware/authMiddleware.js`

**Why it exists:** A "gatekeeper" that runs before protected routes. Checks if the request has a valid JWT token. If yes → continues. If no → returns 401 (Unauthorized).

```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // adds user info to the request
next(); // proceed to the actual controller
```

---

## 📄 `Frontend/src/App.jsx`

**Why it exists:** The main React router. Decides which page to show based on URL and login status.

- `/login` → Show Login page (redirect to / if already logged in)
- `/` → Show Dashboard (redirect to /login if not logged in)
- `/chat/:owner/:repo/:branch` → Show ChatInterface
- On load: `checkAuth()` → calls `/api/auth/me` to see if user is still logged in

---

## 📄 `Frontend/src/api.js`

**Why it exists:** Central file for all HTTP calls. If the backend URL changes, you change it in ONE place.

Uses Axios with `withCredentials: true` so cookies (JWT) are automatically sent with every request.

---

## 📄 `Frontend/src/Components/ChatInterface.jsx`

**Why it exists:** The main chat UI.

Key features:
- Loads previous chat history on mount
- Sends messages → calls `api.saveMessage()`
- Typewriter animation for AI responses (character by character at 5ms/char)
- Renders AI responses as **Markdown** (with code highlighting)
- Shows referenced files below each AI answer

---

# ✅ STEP 7: KEY CONCEPTS SUMMARY

| Concept | One-line explanation |
|---|---|
| RAG | Give the AI relevant documents to read before answering |
| Embedding | Converting text to numbers so similar meanings can be found mathematically |
| Vector Search | Finding documents by meaning-similarity, not keyword |
| JWT | A signed "ticket" that proves who you are to the server |
| TTL Index | Auto-delete MongoDB documents after a time limit |
| Chunking | Breaking large files into smaller pieces AI can process |
| Prompt Template | A pre-written instruction set that guides the AI's behavior |

---

# ✅ STEP 8: INTERVIEW QUESTIONS + STRONG ANSWERS

## 🟢 Category 1: Basic Project Questions

---

**Q: What does your project do?**

**Answer:**
> "GitTalk is an AI-powered code assistant that lets users have a natural language conversation with any GitHub repository. You paste a GitHub URL, the system reads and understands the entire codebase, then you can ask questions like 'How does authentication work?' or 'Where is the database connected?' and get accurate answers with references to the actual source files."

---

**Q: Why did you build this?**

**Answer:**
> "Understanding a new codebase is one of the biggest challenges developers face. Whether you're onboarding onto a new team, reviewing open-source code, or revisiting your own old project, reading thousands of lines of code is slow. I built GitTalk to make that process instant — instead of searching, you just ask."

---

**Q: Who is the target user?**

**Answer:**
> "Developers — particularly those joining a new project, open-source contributors who want to explore a repo before contributing, and students learning from real-world code."

---

## 🟡 Category 2: Architecture Questions

---

**Q: Explain the architecture of your project.**

**Answer:**
> "The project has three main layers. First, a React frontend where users interact — they log in, paste a GitHub URL, and chat. Second, a Node.js Express backend that handles authentication with JWT, stores chat history in MongoDB, and acts as a gateway. Third, a Python FastAPI server that handles all the AI work — it clones GitHub repos, creates vector embeddings using Google Gemini, stores them in MongoDB Atlas, and answers questions using a RAG pipeline. The two backends communicate via internal HTTP calls using Axios."

---

**Q: Why did you use two separate servers — Node.js AND Python?**

**Answer:**
> "Python has a much richer ecosystem for AI tasks — LangChain, Google Gemini, vector databases all have better Python support. Meanwhile, Node.js is excellent for real-time web features, authentication, and serving frontend files. Rather than compromise either, I ran two specialized servers: Node handles everything web/auth-related, Python handles everything AI-related. They communicate internally so the frontend only talks to one server."

---

**Q: How does data flow when a user asks a question?**

**Answer:**
> "The user types a question in React. React sends it to the Node backend with their JWT cookie. Node verifies authentication, then proxies the question to the Python server. Python converts the question into a vector embedding, searches MongoDB Atlas for the 5 most similar code chunks from that specific repo, stuffs those chunks into a Gemini prompt, gets an answer, and returns it. Node then saves the Q&A to MongoDB and sends the answer back to React, which displays it with a typewriter animation."

---

## 🔵 Category 3: Tech Stack Questions

---

**Q: What is RAG and why did you use it?**

**Answer:**
> "RAG stands for Retrieval-Augmented Generation. The problem with LLMs is they only know what they were trained on — they know nothing about a private or obscure GitHub repo. RAG solves this by retrieving relevant documents from your own knowledge base and injecting them into the AI prompt. So instead of asking Gemini blindly, I say 'Here are the 5 most relevant code chunks — now answer the user's question based only on these.' This makes answers accurate and grounded in the actual code."

---

**Q: What are embeddings?**

**Answer:**
> "Embeddings are numerical representations of text. You convert a piece of text into a list of hundreds of numbers called a vector. The key property is that texts with similar meaning produce similar vectors. So when a user asks 'how does login work?', I convert that question to a vector and find the code chunks whose vectors are closest — those are the most relevant code snippets, even if they use different words like 'authenticate' instead of 'login'."

---

**Q: Why MongoDB Atlas specifically?**

**Answer:**
> "Two reasons. First, it's a managed cloud database — no infrastructure to manage. Second, and more importantly, MongoDB Atlas has a built-in Vector Search feature. This means I can store my code chunk embeddings as regular MongoDB documents AND search them by vector similarity — all in one database. I didn't need a separate vector database like Pinecone or Weaviate."

---

**Q: How does authentication work?**

**Answer:**
> "Users register with email and password. The password is hashed using bcrypt before storage — we never store plain text passwords. On login, bcrypt compares the entered password with the stored hash. If valid, a JWT is generated using a secret key and stored as an HTTP-only cookie. HTTP-only means JavaScript cannot access it — protecting against XSS attacks. Every protected API request automatically includes this cookie, and the authMiddleware verifies the JWT signature before allowing access."

---

## 🟠 Category 4: Implementation Questions

---

**Q: How do you handle large repositories?**

**Answer:**
> "Two ways. First, before processing I call the GitHub API to check the repo size — if it's over 50MB, I reject it with an error. Second, for the embedding step, I process chunks in batches of 20 with a 4-second sleep between batches. This respects the free-tier rate limits of the Gemini API (15 requests per minute). Without this, large repos would hit API errors."

---

**Q: How do you make sure one user can't see another user's chat about the same repo?**

**Answer:**
> "Every chat message in MongoDB is stored with a `userId` field. When fetching history, the query always filters by both `userId` AND `repoId` — so even if two users chatted about the same repo, they see completely separate conversations. The code embeddings themselves are shared (same repo = same embeddings), but the chat history is user-scoped."

---

**Q: How do you prevent stale data from accumulating in the database?**

**Answer:**
> "I implemented a TTL (Time-To-Live) index on the `metadata.created_at` field in the code_chunks collection. MongoDB automatically deletes documents where this timestamp is older than 48 hours. Whenever a user actively chats about a repo, I call `refresh_repo_timestamp()` which updates the `created_at` field to the current time — so active repos are never deleted. Inactive repos clean themselves up after 48 hours."

---

**Q: How does the typewriter animation work?**

**Answer:**
> "In the `MessageBubble` component, when a new AI message arrives with `animate: true`, a `setInterval` runs every 5 milliseconds, appending one character at a time from the full message to a `displayedText` state variable. The displayed text grows character by character until all characters are shown, then the interval is cleared. Old messages loaded from history don't have `animate: true`, so they display instantly."

---

## 🔴 Category 5: Challenges and Improvements

---

**Q: What challenges did you face?**

**Answer:**
> "Several interesting ones:
> 1. **Branch handling** — GitHub repos sometimes use 'main' and sometimes 'master'. I added a fallback: if cloning with 'main' fails, automatically retry with 'master'.
> 2. **Rate limiting** — Gemini's free tier only allows 15 embedding requests per minute. I had to add 4-second delays between batches of 20 chunks.
> 3. **Windows file system** — On Windows, Git creates read-only files. Deleting the temp repo folder failed. I added a `remove_readonly` function that changes file permissions before deletion.
> 4. **Repo ID with slashes** — The repo ID format (`owner/repo/branch`) contains slashes which break URL routing. Solved by passing `repoId` in the request body instead of the URL."

---

**Q: What improvements would you make?**

**Answer:**
> "Several good ones:
> 1. **Streaming responses** — Currently the full answer loads at once. With streaming (SSE or WebSockets), the AI could stream word by word like ChatGPT.
> 2. **Re-indexing on repo update** — Currently if the repo gets new commits, the old embeddings stay. I'd add a webhook or manual 're-index' button.
> 3. **User-specific repos** — The code embeddings are currently shared across all users. If the repo is private, this would be a security problem. I'd add user-scoped storage.
> 4. **Better chunking strategy** — The current splitter breaks at character boundaries. A smarter approach would split by function or class boundaries so each chunk represents a complete logical unit.
> 5. **Caching** — Add Redis to cache frequent questions so common queries don't hit Gemini every time."

---

## 🟣 Category 6: Scalability Questions

---

**Q: How would you scale this system?**

**Answer:**
> "Currently both servers run on a single machine. To scale:
> 1. **Horizontal scaling** — Run multiple Python FastAPI instances behind a load balancer for concurrent ingestion requests.
> 2. **Queue system** — Use Redis Queue or Celery to handle ingestion as background jobs. Currently ingestion is synchronous and can timeout for large repos.
> 3. **Separate databases** — Currently code embeddings and user data share the same MongoDB Atlas cluster. In production, I'd separate them.
> 4. **CDN** — Serve the React static files from a CDN instead of the Node.js server."

---

## ⚫ Category 7: Security Questions

---

**Q: What security measures did you implement?**

**Answer:**
> "Several:
> 1. **bcrypt password hashing** — Passwords are never stored in plain text
> 2. **JWT with HTTP-only cookies** — Tokens are inaccessible to JavaScript (XSS protection)
> 3. **Auth middleware** — All sensitive routes verify the token before processing
> 4. **Repo size limit** — 50MB cap prevents DoS through massive repo processing
> 5. **CORS configuration** — Only allowed origins can call the backend"

---

**Q: What security vulnerabilities exist?**

**Answer (be honest — shows maturity):**
> "A few I'm aware of:
> 1. Code embeddings are shared across all users — a private repo's code could theoretically be searched by another user who knows the repo ID.
> 2. There's no rate limiting on the ingestion endpoint — an attacker could flood it with requests.
> 3. The JWT secret and API keys are in environment variables — good practice, but if the server is compromised, those are exposed.
> I'd fix these in production with user-scoped storage, rate limiting middleware, and a secrets manager like AWS Secrets Manager."

---

## 🔵 Category 8: Deep Technical Questions

---

**Q: What's the difference between `similarity` search and `mmr` (Maximal Marginal Relevance)?**

**Answer:**
> "Similarity search returns the K most similar documents to the query — but they might all be very similar to each other too (redundant). MMR balances similarity to the query with diversity among the results. For a codebase, MMR would be better because you'd want code from different files rather than 5 chunks from the same function."

---

**Q: Why `chunk_overlap=150`?**

**Answer:**
> "When you split a 3000-character file into 1000-character chunks, important information might sit exactly at a boundary — the first part of a sentence is in chunk 1, the second part in chunk 2. With 150 characters of overlap, each chunk shares 150 characters with the next, ensuring nothing important is split in half."

---

**Q: Why `k=5` in the retriever?**

**Answer:**
> "I retrieve the top 5 most relevant code chunks for each question. Too few (1-2) might miss important context. Too many (20+) would exceed Gemini's context window and also add noise. 5 is a practical balance that covers most questions while keeping the prompt manageable. This is a tunable parameter that could be optimized."

---

**Q: What happens if someone passes a private GitHub repo?**

**Answer:**
> "Currently, `GitLoader` would fail with an authentication error because it tries to clone via HTTPS without credentials. The error would propagate back to the user. A future improvement would be to support GitHub personal access tokens — the user would provide their token, and GitLoader would use it to clone private repos."

---

# 🎯 QUICK REVISION SUMMARY

```
GitTalk = "Chat with any GitHub repo using AI"

Tech Stack:
- Frontend: React + Vite + Tailwind CSS
- Node Backend: Express + MongoDB + JWT auth
- Python Backend: FastAPI + LangChain + Gemini + MongoDB Vector Search

Core Flow:
GitHub URL → Clone → Chunk → Embed → Store in MongoDB
Question → Embed → Vector Search (top 5 chunks) → Gemini → Answer

Key Concepts:
- RAG: Give AI relevant code before asking it questions
- Embeddings: Text → Numbers (similar text = similar numbers)
- Vector Search: Find documents by meaning, not keywords
- TTL Index: Auto-delete unused repo data after 48 hours
- JWT: Secure, stateless authentication via HTTP-only cookies
```

---

*Good luck tomorrow! You've got this. 🚀*
