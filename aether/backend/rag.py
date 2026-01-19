import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from brain import ask_llm

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
BASE_VECTOR_PATH = "vectorstore"


def process_text(text: str, doc_id: str):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = splitter.split_text(text)
    doc_path = os.path.join(BASE_VECTOR_PATH, doc_id)

    if os.path.exists(doc_path):
        db = FAISS.load_local(
            doc_path,
            embeddings,
            allow_dangerous_deserialization=True
        )
        db.add_texts(chunks)
    else:
        db = FAISS.from_texts(chunks, embeddings)

    os.makedirs(doc_path, exist_ok=True)
    db.save_local(doc_path)


def query_rag(question: str, doc_id: str, history: list[dict]):
    doc_path = os.path.join(BASE_VECTOR_PATH, doc_id)

    if not os.path.exists(doc_path):
        return "Document not found."

    db = FAISS.load_local(
        doc_path,
        embeddings,
        allow_dangerous_deserialization=True
    )

    docs = db.similarity_search(question, k=3)
    context = "\n\n".join(d.page_content for d in docs)

    return ask_llm(
        context=context,
        question=question,
        history=history
    )
