import { useState, useRef, useEffect } from "react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Scroll automático al final cuando llegan nuevos mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const texto = input.trim();
    if (!texto) return;

    // agregamos el mensaje del usuario
    setMessages((prev) => [...prev, { role: "user", content: texto }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: texto }),
      });
      const { answer } = await res.json();

      // agregamos la respuesta del asistente
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Ha ocurrido un error al conectar con el servidor. Por favor, inténtalo de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>SDD RAG Chatbot</h1>

      <div style={styles.chatWindow}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              ...(msg.role === "user"
                ? styles.userBubble
                : styles.assistantBubble),
            }}
          >
            {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta..."
          disabled={loading}
        />
        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? "Enviando…" : "Enviar"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    height: "100vh",
    margin: "0 auto",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    background: "#1e1e1e",
    color: "#e0e0e0",
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
    color: "#fff",
  },
  chatWindow: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    background: "#2e2e2e",
    overflowY: "auto",
    boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
    marginBottom: 12,
  },
  message: {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: 16,
    margin: "6px 0",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  userBubble: {
    background: "#3a8fb7",
    color: "#fff",
    alignSelf: "flex-end",
  },
  assistantBubble: {
    background: "#3c3c3c",
    color: "#e0e0e0",
    border: "1px solid #555",
    alignSelf: "flex-start",
  },
  form: {
    display: "flex",
    gap: 8,
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 4,
    border: "1px solid #555",
    background: "#3c3c3c",
    color: "#e0e0e0",
    fontSize: 14,
  },
  button: {
    padding: "10px 18px",
    borderRadius: 4,
    border: "none",
    background: "#3a8fb7",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: 14,
  },
};

export default App;
