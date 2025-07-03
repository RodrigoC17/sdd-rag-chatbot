import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, User } from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL as string;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  think?: string;
  timestamp: Date;
}

const ChatUI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "¡Hola! Soy tu asistente y estoy aquí para ayudarte a responder preguntas sobre Tienda Alemana. ¿En qué puedo ayudarte hoy?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  // Extrae <think> y limpia markdown/LaTeX
  const processBotText = (raw: string) => {
    const thinkMatch = raw.match(/<think>[\s\S]*?<\/think>/gi);
    const thinkText = thinkMatch
      ? thinkMatch.map((t) => t.replace(/<\/?think>/gi, "").trim()).join("\n")
      : undefined;
    let txt = raw.replace(/<think>[\s\S]*?<\/think>/gi, "");
    txt = txt.replace(/\\boxed\{\\text\{([\s\S]*?)\}\}/g, "$1");
    txt = txt.replace(/\\boxed\{([\s\S]*?)\}/g, "$1");
    txt = txt.replace(/\\text\{([\s\S]*?)\}/g, "$1");
    txt = txt.replace(/\$\$[\s\S]*?\$\$/g, "");
    // txt = txt.replace(/\$[^$]+\$/g, "");
    txt = txt.replace(/\\(?!text)[a-zA-Z]+\{[\s\S]*?\}/g, "");
    txt = txt.replace(/(\*\*|__|\*|_|#{1,6}|[-*+]\s)/g, "");
    txt = txt.trim();
    return {
      text: txt || "Lo siento, no pude generar una respuesta clara.",
      think: thinkText,
    };
  };

  const sendMessage = async () => {
    if (!inputText.trim()) {
      setError("Por favor, escribe una pregunta");
      inputRef.current?.focus();
      return;
    }
    setError(null);
    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInputText("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg.text }),
      });
      if (!res.ok) throw new Error(`Servidor: ${res.status}`);
      setIsConnected(true);
      const { answer } = await res.json();
      const { text, think } = processBotText(answer || "");
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text,
        think,
        isUser: false,
        timestamp: new Date(),
      };
      setTimeout(() => {
        setMessages((m) => [...m, botMsg]);
        setIsLoading(false);
      }, 300);
    } catch (e: unknown) {
      setIsConnected(false);
      setIsLoading(false);
      let errorMessage = "Error de conexión";
      if (e instanceof Error) errorMessage = e.message;
      setError(errorMessage);
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Lo siento, hubo un problema al procesar tu pregunta.",
        isUser: false,
        timestamp: new Date(),
      };
      setTimeout(() => setMessages((m) => [...m, errMsg]), 300);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md border-b px-4 py-4 shadow-sm">
        <div className="flex items-center space-x-3 max-w-4xl mx-auto">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Chatbot - Tienda Alemana
            </h1>
            <p className="text-sm text-gray-600">
              Obligatorio - Rodrigo Calleros - 232814
            </p>
          </div>
        </div>
      </div>
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((m, i) => (
          <div
            key={m.id}
            className={`flex ${
              m.isUser ? "justify-end" : "justify-start"
            } animate-fade-in`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div
              className={`flex items-end space-x-2 max-w-lg ${
                m.isUser ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  m.isUser
                    ? "bg-gradient-to-r from-blue-500 to-purple-600"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600"
                }`}
              >
                {m.isUser ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <MessageCircle className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`px-4 py-3 rounded-2xl shadow-sm border ${
                  m.isUser
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "bg-white/80 backdrop-blur-sm text-gray-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.think && (
                  <details className="mt-2 bg-gray-100 p-2 rounded">
                    <summary className="cursor-pointer font-medium">
                      Mostrar pensamiento
                    </summary>
                    <pre className="whitespace-pre-wrap mt-1 text-gray-700">
                      {m.think}
                    </pre>
                  </details>
                )}
                <p
                  className={`text-xs mt-1 ${
                    m.isUser ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {formatTime(m.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start space-x-2 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div className="bg-white/70 backdrop-blur-md border-t px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {error && <div className="mb-2 text-red-700">{error}</div>}
          <div className="flex items-end space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKey}
              placeholder="Escribe tu pregunta..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
            >
              {isLoading ? "..." : <Send />}
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-400 mt-1">{inputText.length}/500</p>
            {isConnected ? (
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Sistema conectado</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Sistema desconectado</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;
