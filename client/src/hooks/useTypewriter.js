// client/src/hooks/useTypewriter.js
import { useEffect, useRef, useState } from "react";

export default function useTypewriter(speedMs = 12) {
  const [text, setText] = useState("");
  const jobRef = useRef(null);

  useEffect(() => {
    if (!text) return;
    let i = 0;
    const s = String(text);
    if (jobRef.current) clearInterval(jobRef.current);

    const listeners = jobRef.listeners || [];
    jobRef.listeners = listeners;

    jobRef.current = setInterval(() => {
      i += 1;
      const chunk = s.slice(0, i);
      listeners.forEach((fn) => fn(chunk));
      if (i >= s.length) {
        clearInterval(jobRef.current);
        jobRef.current = null;
      }
    }, speedMs);

    return () => {
      if (jobRef.current) clearInterval(jobRef.current);
      jobRef.current = null;
    };
  }, [text, speedMs]);

  const onChunk = (fn) => {
    if (!jobRef.listeners) jobRef.listeners = [];
    jobRef.listeners.push(fn);
    return () => {
      jobRef.listeners = (jobRef.listeners || []).filter((f) => f !== fn);
    };
  };

  return { setText, onChunk };
}
