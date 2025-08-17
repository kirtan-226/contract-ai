import { useCallback, useEffect, useRef, useState } from "react";
import { startAnalysis, analyzePdf } from "../services/api.js";
import useTypewriter from "./useTypewriter.js";

export function useChat() {
  const [messages, setMessages] = useState([
    {
      id: id(),
      role: "bot",
      content: "Hi! I'm your friendly chatbot. Paste a contract, upload a PDF, or say hi.",
      ts: Date.now(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const { setText: typeText, onChunk } = useTypewriter(10);
  const lastBotIdRef = useRef(null);

  // subscribe once to typewriter chunks to update the last bot message
  useEffect(() => {
    const unsubscribe = onChunk((typed) => {
      const lastId = lastBotIdRef.current;
      if (!lastId) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === lastId ? { ...m, content: typed } : m))
      );
    });
    return unsubscribe;
  }, [onChunk]);

  const pushUser = (text) => {
    setMessages((prev) => [
      ...prev,
      { id: id(), role: "user", content: text, ts: Date.now() },
    ]);
  };

  const pushBotPlaceholder = () => {
    const botId = id();
    lastBotIdRef.current = botId;
    setMessages((prev) => [
      ...prev,
      { id: botId, role: "bot", content: "", ts: Date.now() },
    ]);
    return botId;
  };

  const sendMessage = useCallback(
    async (text) => {
      if (!text?.trim()) return;
      pushUser(text.trim());
      setIsThinking(true);
      try {
        const resp = await startAnalysis(text.trim()); // { prompt, output }
        pushBotPlaceholder();
        typeText(resp?.output || "No response.");
      } catch (e) {
        const err = `Error: ${String(e.message || e)}`;
        setMessages((prev) => [
          ...prev,
          { id: id(), role: "bot", content: err, ts: Date.now() },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [typeText]
  );

  const sendPdf = useCallback(
    async (file) => {
      if (!file) return;
      pushUser(`📄 Uploaded PDF: ${file.name}`);
      setIsThinking(true);
      try {
        const resp = await analyzePdf(file);
        pushBotPlaceholder();
        const header = resp?.extractedChars
          ? `Extracted ~${resp.extractedChars} chars from PDF.\n\n`
          : "";
        typeText(header + (resp?.output || "No response."));
      } catch (e) {
        const err = `Error analyzing PDF: ${String(e.message || e)}`;
        setMessages((prev) => [
          ...prev,
          { id: id(), role: "bot", content: err, ts: Date.now() },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [typeText]
  );

  const clear = useCallback(() => {
    if (!confirm("Clear the conversation?")) return;
    setMessages([
      {
        id: id(),
        role: "bot",
        content: "Chat cleared. Paste a contract, upload a PDF, or say hi.",
        ts: Date.now(),
      },
    ]);
  }, []);

  return { messages, sendMessage, sendPdf, isThinking, clear };
}

function id() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
