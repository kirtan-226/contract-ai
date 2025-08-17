import React, { useMemo, useRef, useState, useEffect } from "react";
import MessageBubble from "./MessageBubble.jsx";
import { useChat } from "../hooks/useChat.js";

export default function ChatWindow({ storageKey = "chatbot_messages_v2" }) {
  const { messages, sendMessage, sendPdf, isThinking, clear, exportJSON } = useChat(storageKey);
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  const canSend = useMemo(() => input.trim().length > 0 && !isThinking, [input, isThinking]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  async function handleSend() {
    if (!canSend) return;
    const text = input.trim();
    setInput("");
    await sendMessage(text);
  }

  async function handlePickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset for future uploads of same file
    await sendPdf(file);
  }

  return (
    <div className="rounded-2xl shadow-lg bg-white ring-1 ring-black/5 overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-end gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
        <label className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg cursor-pointer">
          Upload PDF
          <input type="file" accept="application/pdf" onChange={handlePickFile} className="hidden" />
        </label>
        <button onClick={exportJSON} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg">Export</button>
        <button onClick={clear} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg">Clear</button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-50">
        <div className="space-y-3">
          {messages.map(m => (
            <MessageBubble key={m.id} role={m.role} content={m.content} ts={m.ts} />
          ))}
          {isThinking && (
            <div className="text-sm text-neutral-600">Thinking…</div>
          )}
        </div>
      </div>

      <div className="border-t bg-white p-3 sm:p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-end gap-2"
        >
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message... or upload a PDF (Shift+Enter = newline)"
            className="flex-1 resize-none rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-neutral-50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            type="submit"
            disabled={!canSend}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white bg-indigo-600 disabled:opacity-50 hover:bg-indigo-700"
          >
            Send
          </button>
        </form>
        <p className="mt-2 text-[11px] text-neutral-500">Your chat is saved locally on this device.</p>
      </div>
    </div>
  );
}
