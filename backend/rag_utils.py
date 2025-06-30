import os
from typing import List

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.chat_models import ChatOllama
from langchain.schema import Document


# Directory where the vector database will be stored
PERSIST_DIR = os.path.join("backend", "data", "chroma")
PDF_DIR = os.path.join("backend", "data", "pdfs")


def create_vector_db(pdf_dir: str = PDF_DIR, persist_dir: str = PERSIST_DIR) -> Chroma:
    """Load PDFs, split text and store embeddings in Chroma."""
    docs: List[Document] = []
    if not os.path.exists(pdf_dir):
        raise FileNotFoundError(f"PDF directory not found: {pdf_dir}")

    for file in os.listdir(pdf_dir):
        if file.lower().endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(pdf_dir, file))
            docs.extend(loader.load())

    if not docs:
        raise ValueError("No PDF files found to index.")

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = splitter.split_documents(docs)
    embeddings = OllamaEmbeddings(model="llama3")

    vectordb = Chroma.from_documents(documents=splits, embedding=embeddings, persist_directory=persist_dir)
    vectordb.persist()
    return vectordb


def load_vector_db(persist_dir: str = PERSIST_DIR) -> Chroma:
    """Load an existing Chroma vector database."""
    embeddings = OllamaEmbeddings(model="llama3")
    return Chroma(persist_directory=persist_dir, embedding_function=embeddings)


def ask_question(question: str, vectorstore: Chroma, model: str = "llama3") -> str:
    """Search the vector DB and query the LLM with context."""
    docs = vectorstore.similarity_search(question, k=3)
    context = "\n\n".join([doc.page_content for doc in docs])
    prompt = (
        "Responde la pregunta bas\u00e1ndote \u00fanicamente en el contexto provisto. "
        "Si la respuesta no se encuentra, indica que no puedes responder.\n\n"
        f"Contexto:\n{context}\n\nPregunta: {question}\nRespuesta:"
    )

    try:
        llm = ChatOllama(model=model)
        return llm.invoke(prompt).content.strip()
    except Exception as e:
        raise RuntimeError(
            "No se pudo conectar con Ollama o el modelo no est\u00e1 disponible."
        ) from e


