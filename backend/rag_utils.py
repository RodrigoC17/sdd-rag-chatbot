import os
from typing import List

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.chat_models import ChatOllama
from langchain.schema import Document

# Directorios principales
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PERSIST_DIR = os.path.join(BASE_DIR, "data", "chroma")
PDF_DIR = os.path.join(BASE_DIR, "data", "pdfs")

def create_vector_db(pdf_dir: str = PDF_DIR, persist_dir: str = PERSIST_DIR) -> Chroma:
    """Carga los PDFs, los divide y almacena los embeddings en Chroma."""
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
    embeddings = OllamaEmbeddings(model="nomic-embed-text")  # Usa modelo de embeddings, no de texto

    vectordb = Chroma.from_documents(documents=splits, embedding=embeddings, persist_directory=persist_dir)
    vectordb.persist()
    return vectordb

def load_vector_db(persist_dir: str = PERSIST_DIR) -> Chroma:
    """Carga una base vectorial de Chroma ya existente."""
    embeddings = OllamaEmbeddings(model="nomic-embed-text")  
    return Chroma(persist_directory=persist_dir, embedding_function=embeddings)

def ask_question(question: str, vectorstore: Chroma, model: str = "deepseek-r1:1.5b") -> str:
    """Busca en la base vectorial y consulta el modelo LLM con el contexto."""
    # 1) Recupero los documentos más similares
    docs = vectorstore.similarity_search(question, k=10)
    # 2) Construyo el contexto filtrando vacíos
    context = "\n\n".join(d.page_content for d in docs if d.page_content.strip())

    if not context:
        return "No puedo responder."

    prompt = rf"""
        Responde SOLO con la información exacta del contexto a continuación
        La respuesta debe estar en español, en texto plano, sin símbolos matemáticos, sin LaTeX, sin paréntesis, sin corchetes, sin comillas, sin barras invertidas, sin ningún formato especial, y SIN usar \boxed ni nada similar
        Si la respuesta no está explícita en el contexto ni en texto plano, responde exactamente: No puedo responder

        Contexto:
        {context}

        Pregunta:
        {question}

        Respuesta:
        """

    try:
        llm = ChatOllama(model=model, temperature=0)
        result = llm.invoke(prompt)
        return result.content.strip()
    except Exception as e:
        raise RuntimeError(
            "No se pudo conectar con Ollama o el modelo no está disponible."
        ) from e