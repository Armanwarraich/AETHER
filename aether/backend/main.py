from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from brain import handle_memory_command
from pdf_reader import read_pdf
from rag import process_text, query_rag
from pydantic import BaseModel
import shutil
import uuid
import os
import json

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Paths ----------------
CHAT_PATH = "chat_memory"
os.makedirs(CHAT_PATH, exist_ok=True)

# ---------------- Health Check ----------------
@app.get("/")
def health():
    return {"status": "AETHER backend running"}

# ---------------- Upload ----------------
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    doc_id = str(uuid.uuid4())
    temp_path = f"{doc_id}.pdf"

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        text = read_pdf(temp_path)

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    if not text:
        raise HTTPException(
            status_code=400,
            detail="No readable text found in PDF"
        )

    process_text(text, doc_id)
    return {"doc_id": doc_id}

# ---------------- Chat Schema ----------------
class ChatRequest(BaseModel):
    doc_id: str
    question: str

# ---------------- Chat ----------------
@app.post("/chat")
def chat(req: ChatRequest):
    memory_reply = handle_memory_command(req.question)
    if memory_reply:
        return {"answer": memory_reply}

    chat_file = os.path.join(CHAT_PATH, f"{req.doc_id}.json")
    history = []

    if os.path.exists(chat_file):
        try:
            with open(chat_file, "r", encoding="utf-8") as f:
                history = json.load(f)
        except Exception:
            history = []

    history.append({"role": "user", "content": req.question})

    try:
        answer = query_rag(
            question=req.question,
            doc_id=req.doc_id,
            history=history
        )
    except Exception:
        answer = "⚠️ Something went wrong while answering. Please try again."

    history.append({"role": "assistant", "content": answer})

    with open(chat_file, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    return {"answer": answer}

# 🆕 ---------------- READ CHAT HISTORY (ADD ONLY) ----------------
@app.get("/history/{doc_id}")
def get_history(doc_id: str):
    chat_file = os.path.join(CHAT_PATH, f"{doc_id}.json")
    if not os.path.exists(chat_file):
        return []

    try:
        with open(chat_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

# ---------------- New Chat ----------------
@app.post("/new-chat/{doc_id}")
def new_chat(doc_id: str):
    chat_file = os.path.join(CHAT_PATH, f"{doc_id}.json")
    if os.path.exists(chat_file):
        os.remove(chat_file)
    return {"status": "New chat started"}

# ---------------- Delete Document ----------------
@app.delete("/document/{doc_id}")
def delete_document(doc_id: str):
    vec_path = os.path.join("vectorstore", doc_id)
    chat_file = os.path.join(CHAT_PATH, f"{doc_id}.json")

    if os.path.exists(vec_path):
        shutil.rmtree(vec_path)

    if os.path.exists(chat_file):
        os.remove(chat_file)

    return {"status": "Document deleted"}
