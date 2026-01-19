"use client";

import { useEffect, useState } from "react";
import { Send, FileText, Trash2, RotateCcw, Bot, Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChatPage() {
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- Load documents ---------------- */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("docs") || "[]");
    const normalized = stored.map((d) =>
      typeof d === "string"
        ? { id: d, title: `Chat ${d.slice(0, 6)}` }
        : d
    );
    setDocs(normalized);
    setSelectedDoc(normalized[0] || null);
  }, []);

  /* ---------------- Load history ---------------- */
  useEffect(() => {
    if (!selectedDoc) return;

    fetch(`http://127.0.0.1:8000/history/${selectedDoc.id}`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((m) => ({
          role: m.role,
          text: m.content,
        }));
        setChatMessages((prev) => ({
          ...prev,
          [selectedDoc.id]: formatted,
        }));
      })
      .catch(() => {});
  }, [selectedDoc]);

  const messages = selectedDoc
    ? chatMessages[selectedDoc.id] || []
    : [];

  /* ---------------- Send message ---------------- */
  async function sendMessage() {
    if (!input.trim() || !selectedDoc || loading) return;

    const text = input.trim();
    setInput("");
    setLoading(true);

    setChatMessages((prev) => ({
      ...prev,
      [selectedDoc.id]: [...(prev[selectedDoc.id] || []), { role: "user", text }],
    }));

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doc_id: selectedDoc.id,
          question: text,
        }),
      });

      const data = await res.json();

      setChatMessages((prev) => ({
        ...prev,
        [selectedDoc.id]: [
          ...(prev[selectedDoc.id] || []),
          { role: "assistant", text: data.answer },
        ],
      }));
    } catch {
      setChatMessages((prev) => ({
        ...prev,
        [selectedDoc.id]: [
          ...(prev[selectedDoc.id] || []),
          { role: "assistant", text: "⚠️ Something went wrong." },
        ],
      }));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function renameChat(doc) {
    const name = prompt("Rename chat:", doc.title);
    if (!name) return;

    const updated = docs.map((d) =>
      d.id === doc.id ? { ...d, title: name } : d
    );

    setDocs(updated);
    localStorage.setItem("docs", JSON.stringify(updated));
    setSelectedDoc({ ...doc, title: name });
  }

  async function newChat() {
    if (!selectedDoc) return;
    await fetch(`http://127.0.0.1:8000/new-chat/${selectedDoc.id}`, {
      method: "POST",
    });
    setChatMessages((prev) => ({ ...prev, [selectedDoc.id]: [] }));
  }

  async function deleteDoc() {
    if (!selectedDoc) return;
    if (!confirm("Delete document permanently?")) return;

    await fetch(`http://127.0.0.1:8000/document/${selectedDoc.id}`, {
      method: "DELETE",
    });

    const updatedDocs = docs.filter((d) => d.id !== selectedDoc.id);
    setDocs(updatedDocs);
    localStorage.setItem("docs", JSON.stringify(updatedDocs));

    setChatMessages((prev) => {
      const copy = { ...prev };
      delete copy[selectedDoc.id];
      return copy;
    });

    setSelectedDoc(updatedDocs[0] || null);
  }

  /* ===================== UI ===================== */
  return (
    <div className="flex h-screen bg-zinc-100 text-zinc-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b font-semibold flex items-center gap-2">
          <FileText size={18} /> Chats
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer
                transition-colors duration-200
                ${
                  selectedDoc?.id === doc.id
                    ? "bg-zinc-200"
                    : "hover:bg-zinc-100"
                }`}
            >
              <span onClick={() => setSelectedDoc(doc)} className="truncate">
                {doc.title}
              </span>
              <button onClick={() => renameChat(doc)}>
                <Pencil size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t space-y-2">
          <button onClick={newChat} className="w-full flex gap-2 text-sm">
            <RotateCcw size={14} /> New Chat
          </button>
          <button
            onClick={deleteDoc}
            className="w-full flex gap-2 text-sm text-red-600"
          >
            <Trash2 size={14} /> Delete Document
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`
                  max-w-[75%] rounded-xl px-4 py-3 text-sm border
                  animate-slideUp
                `}
              >
                {m.role === "assistant" && <Bot size={16} />}
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        {/* Fixed input */}
        <div className="border-t px-6 py-4 bg-white">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter to send, Shift+Enter for new line"
          />
          <button
            onClick={sendMessage}
            className="mt-2 bg-black text-white px-4 py-2 rounded
              transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
