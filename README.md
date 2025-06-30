# SDD RAG Chatbot

Proyecto para la materia **Sistemas de Soporte y Decisi\u00f3n**. Permite consultar archivos PDF utilizando recuperaci\u00f3n aumentada por generaci\u00f3n (RAG) con un modelo LLM local.

## Requisitos
- Python 3.10+
- Node.js 18+
- Un servidor de Ollama corriendo en `localhost:11434` con el modelo `llama3`

## Instalaci\u00f3n

1. Clonar el repositorio y colocar los PDFs a indexar en `backend/data/pdfs/`.
2. Instalar dependencias de Python:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Instalar dependencias del frontend:
   ```bash
   cd frontend
   npm install
   ```
4. Iniciar Ollama y descargar el modelo necesario:
   ```bash
   ollama run llama3
   ```

## Ejecuci\u00f3n

1. Levantar el backend:
   ```bash
   uvicorn backend.app:app --reload
   ```
2. En otra terminal, iniciar el frontend:
   ```bash
   cd frontend
   npm run dev
   ```
3. Abrir `http://localhost:5173` en el navegador y realizar preguntas.

Si el modelo en Ollama no se encuentra disponible, el backend devolver\u00e1 un mensaje de error.

## Estructura
- `backend/` c\u00f3digo Python y PDFs
- `frontend/` aplicaci\u00f3n React

## Licencia
Distribuido bajo la licencia MIT. Ver `LICENSE` para m\u00e1s detalles.

