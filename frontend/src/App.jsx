import { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      setAnswer("Error al conectar con el backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>SDD RAG Chatbot</h1>
      <form onSubmit={handleSubmit}>
        <input
          style={{ width: "80%" }}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Escribe tu pregunta"
        />
        <button type="submit" disabled={loading}>
          Preguntar
        </button>
      </form>
      <div style={{ marginTop: 20 }}>
        {loading ? "Cargando..." : answer}
      </div>
    </div>
  );
}

export default App

