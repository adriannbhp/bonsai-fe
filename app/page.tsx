"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

type Message = {
  sender: "user" | "bot";
  text: string;
};

export default function Home() {
  const [sessionId] = useState(() => 929298389283923);
  //Date.now().toString() + Math.random().toString(36).substring(2)
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Halo! Ada yang bisa saya bantu?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      //const sessionId = sessionId; // Ganti dengan sessionId sesuai kebutuhan
      const res = await axios.post(
        "/api/chat-dialogflow", // "https://website-sicete-1047513137782.us-central1.run.app/chat",
        {
          text: input,
          sessionId: sessionId,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = res.data;
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply || "Maaf, terjadi kesalahan." } as Message,
      ]);

      // Speech synthesis (opsional)
      if ("speechSynthesis" in window && data.reply) {
        const utterance = new SpeechSynthesisUtterance(data.reply);
        utterance.lang = "id-ID";
        speechSynthesis.speak(utterance);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Mohon maaf terjadi kesalahan saat pengambilan data" },
      ]);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6f8fa] font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg flex flex-col h-[70vh] border border-[#e0e0e0]">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#e0e0e0] bg-[#2196f3] rounded-t-2xl">
          <img
            src="https://padiumkm.id/_next/static/media/logo.08a5ef96.svg"
            alt="Logo"
            className="w-8 h-8"
          />
          <span className="text-white font-semibold text-lg">Si Cete UMKM</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#f6f8fa]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[75%] shadow-sm text-sm ${
                  msg.sender === "user"
                    ? "bg-[#2196f3] text-white rounded-br-sm"
                    : "bg-white text-gray-800 border border-[#e0e0e0] rounded-bl-sm"
                }`}
              >
                {msg.sender === "bot" && /\|.*\|/.test(msg.text)
                  ? renderMarkdownTable(msg.text)
                  : (msg.sender === "bot"
                      ? formatNumberGroups(msg.text)
                      : msg.text)
                }
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-[#e0e0e0] bg-white flex gap-2 rounded-b-2xl">
          <input
            className="flex-1 border border-[#e0e0e0] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2196f3] text-sm"
            type="text"
            placeholder="Ketik pesan..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="bg-[#2196f3] text-white px-5 py-2 rounded-xl font-semibold hover:bg-[#1976d2] transition"
            onClick={sendMessage}
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}

function formatNumberInText(text: string): string {
  return text.replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, (match) => {
    // Pastikan hanya angka utuh yang diubah, bukan bagian dari kata
    return match + ".";
  }).replace(/(\d+)\.(?=\d{3}\b)/g, (m) => m); // Hilangkan titik di akhir jika bukan ribuan
}

// Versi lebih baik (menggunakan Intl.NumberFormat untuk setiap angka)
function formatNumberGroups(text: string): string {
  return text.replace(/\d{4,}/g, (num) =>
    Number(num).toLocaleString("id-ID")
  );
}

function parseMarkdownTable(markdown: string) {
  const lines = markdown.trim().split("\n").filter(line => line.trim().startsWith("|"));
  if (lines.length < 2) return null;
  const header = lines[0].split("|").map(cell => cell.trim()).filter(Boolean);
  const rows = lines.slice(2).map(line =>
    line.split("|").map(cell => cell.trim()).filter(Boolean)
  );
  return { header, rows };
}

function renderMarkdownTable(markdown: string) {
  const table = parseMarkdownTable(markdown);
  if (!table) return null;
  return (
    <div className="overflow-x-auto my-2">
      <table className="min-w-max text-xs border">
        <thead>
          <tr>
            {table.header.map((cell, idx) => (
              <th key={idx} className="border px-2 py-1 bg-[#e3f0fc]">{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="border px-2 py-1">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}