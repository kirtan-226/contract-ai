const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export async function startAnalysis(text) {
  const r = await fetch(`${API_BASE}/api/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.detail || data?.error || "Failed to start");
  return data;
}

export async function continueAnalysis(sessionId, answers) {
  const r = await fetch(`${API_BASE}/api/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, answers }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.detail || data?.error || "Failed to continue");
  return data;
}