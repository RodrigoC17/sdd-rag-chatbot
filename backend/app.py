from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

from rag_utils import create_vector_db, load_vector_db, ask_question, PERSIST_DIR

app = FastAPI(title="Obligatorio Calleros - 232814")

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure vector DB exists
if not os.path.exists(PERSIST_DIR):
    os.makedirs(PERSIST_DIR, exist_ok=True)
    try:
        create_vector_db()
        print("Vector DB created")
    except Exception as e:
        print(f"No se pudo crear la base vectorial: {e}")

vectorstore = load_vector_db()


class Question(BaseModel):
    question: str


@app.post("/ask")
async def ask(question: Question):
    try:
        answer = ask_question(question.question, vectorstore)
        return {"answer": answer}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

