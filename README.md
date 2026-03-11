# 📄 Aether — Local RAG Document Chat System

Aether is a fully local AI document assistant that allows users to upload PDFs and chat with them using a Retrieval‑Augmented Generation (RAG) pipeline powered by **Ollama + FAISS + FastAPI + React.**

The system builds embeddings locally, stores vector indexes per document, and enables contextual question answering with streaming responses.

---

## 🚀 Features

- 📄 Upload PDF documents
- 🔎 Semantic search using FAISS vector database
- 🧠 Local LLM responses via Ollama (Mistral)
- ⚡ Batch embeddings using Ollama embedding API
- 📊 Financial document detection + revenue chart generation
- 💬 Chat memory per document
- 📡 Streaming AI responses
- 🧩 Multi‑document comparison support
- 🟢 Fully local → No data leaves your machine

---

## 🧠 Architecture Overview

User Upload PDF  
→ Backend extracts text  
→ Text chunking  
→ Batch embedding via Ollama  
→ FAISS vector index creation  
→ Stored per document  
→ User asks question  
→ Relevant chunks retrieved  
→ Prompt built with context  
→ Ollama generates answer  

---

---

## ⚙️ Tech Stack

### Backend
- FastAPI
- FAISS
- Ollama
- NumPy
- Rank‑BM25
- PyPDF

### Frontend
- React / Next.js
- Fetch API
- Streaming UI

---

## 🧩 Key Concepts Used

- Retrieval Augmented Generation (RAG)
- Vector similarity search
- Batch embeddings optimization
- Prompt engineering
- Background task processing
- Streaming responses
- Local AI deployment

---

## 🏃 Setup Instructions

### 1️⃣ Clone Repo


git clone https://github.com/yourname/aether.git
cd aether


---

### 2️⃣ Create Virtual Environment
python -m venv venv
venv\Scripts\activate


---

### 3️⃣ Install Dependencies
pip install -r requirements.txt


---

### 4️⃣ Install Ollama

Download from  
👉 https://ollama.com

Pull models:
ollama pull mistral
ollama pull nomic-embed-text


---

### 5️⃣ Run Backend
cd backend
uvicorn main:app --reload


---

### 6️⃣ Run Frontend
cd frontend
npm install
npm run dev


---

### 7️⃣ Open App
http://localhost:3000


---

## ⚡ Performance Optimizations Done

- Replaced HuggingFace embeddings → Ollama batch embeddings
- Reduced embedding calls from **200 → 1**
- Added processing status polling API
- Added streaming LLM responses
- Limited chunk size for faster indexing
- Local FAISS storage per document

---

## 🔐 Privacy

All embeddings, vectors, prompts and documents remain **local on machine.**  
No cloud inference unless explicitly integrated.

---

## 📈 Future Improvements

- GPU FAISS indexing
- Redis cache layer
- Multi‑user authentication
- Document tagging
- Hybrid keyword + vector retrieval tuning

---

## 👨‍💻 Author

Armandeep Singh  
AI/ML Engineer  


Backend is divided into 3 main intelligence layers.

🔵 main.py
Entry point

Upload API

Chat API

Document status API

Background task scheduling

🟣 rag.py (MOST IMPORTANT FILE)
Core AI pipeline:

Chunk document

Generate embeddings via Ollama

Build FAISS index

Retrieve top relevant chunks

Rank using BM25

Send context to LLM

👉 This file is the brain of retrieval intelligence

🟡 brain.py
Handles:

Prompt construction

Chat history injection

Streaming output

Ollama subprocess execution

This is the generation layer

🟢 ChatPage.jsx
Handles:

Upload button

Chat UI

Streaming display

Polling document status

Sidebar document state

✅ ⭐Project Description
AI Document Chat System (RAG Pipeline)
Built a fully local Retrieval‑Augmented Generation system enabling semantic question answering over uploaded PDFs using FAISS vector search and Ollama‑based LLM inference. Implemented batch embedding optimization reducing indexing time by over 90%, streaming response generation, financial document analytics, and per‑document conversational memory. Designed scalable FastAPI backend and interactive React frontend supporting real‑time document processing status tracking.


## 📁 Folder Structure
aether/
├── backend/
│   ├── main.py                  # FastAPI routes
│   ├── rag.py                   # Embedding + FAISS retrieval
│   ├── brain.py                 # LLM prompt + memory
│   ├── pdf_reader.py            # PDF text extraction
│   ├── financial_detector.py    # Detects financial documents
│   ├── financial_extractor.py   # Extracts revenue/profit figures
│   ├── finance_api.py           # Stock price via yfinance
│   ├── analytics/
│   │   └── chart_generator.py   # Revenue trend charts
│   ├── vectorstore/             # Auto-created, gitignored
│   ├── chat_memory/             # Auto-created, gitignored
│   └── requirements.txt
│
└── frontend/
    ├── app/
    │   └── chat/
    │       └── page.js          # Main chat UI
    └── package.json
