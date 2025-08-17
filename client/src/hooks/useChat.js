// client/src/hooks/useChat.js
import { useCallback, useEffect, useRef, useState } from "react";
import { startAnalysis } from "../services/api.js";
import useTypewriter from "./useTypewriter.js";

export function useChat() {
  const [messages, setMessages] = useState(() => ([
    { id: uid(), role: "bot", content: "Hi! Paste a contract (or any text || no pdfs) and I’ll analyze it.", ts: Date.now() }
  ]));
  const [isThinking, setIsThinking] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");
  const { setText: typeText, onChunk } = useTypewriter(10);
  const lastBotIdRef = useRef(null);

  // stream typed text into the last bot message
  useEffect(() => {
    const unsub = onChunk((typed) => {
      const id = lastBotIdRef.current;
      if (!id) return;
      setMessages(prev => prev.map(m => (m.id === id ? { ...m, content: typed } : m)));
    });
    return unsub;
  }, [onChunk]);

  const pushUser = (text) => {
    setMessages(prev => [...prev, { id: uid(), role: "user", content: text, ts: Date.now() }]);
  };

  const pushBotPlaceholder = () => {
    const id = uid();
    lastBotIdRef.current = id;
    setMessages(prev => [...prev, { id, role: "bot", content: "", ts: Date.now() }]);
    return id;
  };

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim()) return;
    const userText = text.trim();
    pushUser(userText);
    setIsThinking(true);

    try {
      const resp = await startAnalysis(userText);   // expects { prompt, output }
      const prompt = resp?.prompt || "";
      const output = resp?.output || "No response.";
      setLastPrompt(prompt);

      pushBotPlaceholder();
      typeText(output);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: uid(),
        role: "bot",
        content: `Error: ${String(e?.message || e)}`,
        ts: Date.now()
      }]);
    } finally {
      setIsThinking(false);
    }
  }, [typeText]);

  const clear = useCallback(() => {
    setMessages([
      { id: uid(), role: "bot", content: "New chat started. Paste your text when ready.", ts: Date.now() }
    ]);
    setLastPrompt("");
  }, []);

  return {
    messages,
    sendMessage,
    isThinking,
    clear,
    lastPrompt, // optional: show behind a “View Prompt” toggle
  };
}

/* helpers */
function uid() {
  return (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) + Date.now().toString(36);
}
