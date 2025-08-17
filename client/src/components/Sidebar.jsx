export default function Sidebar({ threads, activeId, onNew, onPick }) {
  return (
    <aside className="h-screen w-[260px] bg-[#202123] text-gray-200 flex flex-col">
      <div className="p-3 border-b border-black/20">
        <button
          onClick={onNew}
          className="w-full text-left bg-[#343541] hover:bg-[#3e3f4b] transition rounded-md px-3 py-2 text-sm"
        >
          + New chat
        </button>
      </div>

      <div className="px-3 py-2 text-xs uppercase tracking-wide text-gray-400">
        My conversations
      </div>

      <div className="flex-1 overflow-auto px-2 pb-4 space-y-1">
        {threads.map(t => {
          const active = t.id === activeId;
          return (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              className={[
                "w-full text-left px-3 py-2 rounded-md text-sm truncate",
                active ? "bg-[#343541] text-white" : "hover:bg-[#2a2b32]"
              ].join(" ")}
              title={t.sessionId || t.id}
            >
              {t.messages[0]?.content?.slice(0, 40) || "New chat"}
            </button>
          );
        })}
      </div>

      <div className="p-3 text-[11px] text-gray-500 border-t border-black/20">
        <span className="opacity-70">Contract AI • MVP</span>
      </div>
    </aside>
  );
}