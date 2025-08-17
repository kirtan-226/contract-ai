import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import { loadThreads, saveThreads, newThread } from "./lib/threads.js";

const MIN_W = 200;
const MAX_W = 480;
const DEFAULT_W = 260;

export default function App() {
  const [threads, setThreads] = useState(loadThreads);
  const [activeId, setActiveId] = useState(() => threads[0]?.id);
  const active = useMemo(
    () => threads.find((t) => t.id === activeId) || threads[0],
    [threads, activeId]
  );

  // sidebar width + drag state
  const [sidebarW, setSidebarW] = useState(() => {
    const saved = Number(localStorage.getItem("sidebar_w"));
    return Number.isFinite(saved) ? Math.min(MAX_W, Math.max(MIN_W, saved)) : DEFAULT_W;
  });
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => saveThreads(threads), [threads]);
  useEffect(() => localStorage.setItem("sidebar_w", String(sidebarW)), [sidebarW]);

  function newChat() {
    const t = newThread();
    setThreads([t, ...threads]);
    setActiveId(t.id);
  }
  function pickChat(id) {
    setActiveId(id);
  }
  function patchThread(id, patch) {
    setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }
  function pushMessage(id, msg) {
    setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, messages: [...t.messages, msg] } : t)));
  }

  // --- resize handlers ---
  const startDrag = (e) => {
    e.preventDefault?.();
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (clientX) => {
      const left = containerRef.current?.getBoundingClientRect().left ?? 0;
      const next = Math.max(MIN_W, Math.min(MAX_W, clientX - left));
      setSidebarW(next);
    };

    const onMouseMove = (e) => handleMove(e.clientX);
    const onTouchMove = (e) => handleMove(e.touches[0].clientX);
    const stop = () => setDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", stop);

    // nicer UX while dragging
    const prevSel = document.body.style.userSelect;
    const prevCur = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stop);
      document.body.style.userSelect = prevSel;
      document.body.style.cursor = prevCur;
    };
  }, [dragging]);

  // if threads is empty for any reason, bootstrap one
  useEffect(() => {
    if (!threads.length) {
      const t = newThread();
      setThreads([t]);
      setActiveId(t.id);
    }
  }, [threads.length]);

  return (
    <div
      ref={containerRef}
      // Inline styles ensure layout even if Tailwind isn’t loaded
      style={{ display: "flex", minHeight: "100vh", width: "100%" }}
      className={`bg-[#343541] ${dragging ? "select-none" : ""}`}
    >
      {/* Sidebar with dynamic width */}
      <div style={{ width: sidebarW, minWidth: MIN_W, maxWidth: MAX_W }}>
        <Sidebar
          threads={threads}
          activeId={activeId}
          onNew={newChat}
          onPick={pickChat}
        />
      </div>

      {/* Drag handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        style={{ width: 4, cursor: "col-resize" }}
        className="bg-black/20 hover:bg-emerald-500 transition"
        title="Drag to resize"
      />

      {/* Chat takes remaining space */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {active && (
          <ChatWindow
            thread={active}
            onPatch={(p) => patchThread(active.id, p)}
            onPushMessage={(m) => pushMessage(active.id, m)}
          />
        )}
      </div>
    </div>
  );
}
