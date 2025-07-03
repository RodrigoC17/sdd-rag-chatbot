# RAG Chatbot – Obligatorio 2

Este proyecto fue desarrollado como parte del curso **Sistemas de Soporte de Decisión** en la **Universidad ORT Uruguay**.

Combina un backend en **FastAPI** con un frontend en **React + Vite**, e implementa un chatbot con recuperación aumentada por generación (**RAG**) utilizando **LangChain** y **Ollama**.

---

## 🚀 Requisitos

- Python 3.10+
- Node.js 18+
- Ollama instalado localmente con los modelos:
  - `nomic-embed-text`
  - `deepseek-r1:1.5b`

---

## ▶️ Cómo ejecutar

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload
```

### Frontend

```bash
cd frontend
npm install
```

Crear un archivo `.env` con:

```env
VITE_BACKEND_URL=http://localhost:8000
```

Luego ejecutar:

```bash
npm run dev
```

---

## 📁 Estructura

- `backend/` – API FastAPI y lógica de procesamiento de PDFs
- `frontend/` – Interfaz web en React

---

## ⚠️ Nota

Si Ollama se ejecuta en un puerto distinto al predeterminado (`11434`), se puede indicar mediante:

```bash
set OLLAMA_HOST=http://localhost:<PUERTO>
```

---

## 👤 Autor

**Rodrigo Calleros**  
Estudiante de Licenciatura en Sistemas – Universidad ORT Uruguay
