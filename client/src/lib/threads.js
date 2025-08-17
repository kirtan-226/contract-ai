export const newThread = () => ({
  id: crypto.randomUUID(),
  sessionId: null,
  messages: [],      // [{role:'user'|'assistant', content:string}]
  questions: [],
  confidence: null,
  provider: "",
  model: "",
  done: false
});

export function loadThreads() {
  const saved = localStorage.getItem("threads");
  return saved ? JSON.parse(saved) : [newThread()];
}

export function saveThreads(threads) {
  localStorage.setItem("threads", JSON.stringify(threads));
}