import React from "react";
import Header from "../components/Header.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import { useChat } from "../hooks/useChat.js";

export default function ChatPage() {
  const { provider, model, confidence } = useChat("chatbot_messages_v2"); // read-only here
  return (
    <div className="mx-auto max-w-4xl">
      <Header title="Chat with Bot" provider={provider} model={model} confidence={confidence} />
      <ChatWindow storageKey="chatbot_messages_v2" />
    </div>
  );
}
