function Avatar({ role }) {
  const isUser = role === "user";
  return (
    <div
      className={[
        "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
        isUser ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700"
      ].join(" ")}
      aria-hidden
    >
      {isUser ? "U" : "AI"}
    </div>
  );
}

export default function MessageBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[80%] flex gap-3 items-start",
          isUser ? "flex-row-reverse" : "flex-row"
        ].join(" ")}
      >
        <Avatar role={role} />
        <div
          className={[
            "rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap shadow-sm",
            isUser
              ? "bg-emerald-600 text-white"
              : "bg-white text-gray-900 border border-gray-200"
          ].join(" ")}
        >
          {content}
        </div>
      </div>
    </div>
  );
}