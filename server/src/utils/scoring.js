// Weighted scoring + helpers

export function weightScore(parts) {
  // parts: { fraud:0..1, template:0..1, llm:0..1 }
  const w = { fraud: 0.45, template: 0.2, llm: 0.35 };
  const s = (
    (parts.fraud ?? 0) * w.fraud +
    (parts.template ?? 0) * w.template +
    (parts.llm ?? 0) * w.llm
  );
  return clamp01(s);
}

export function clamp01(x) { return Math.max(0, Math.min(1, Number(x) || 0)); }

export function toPercent(x) { return Math.round(clamp01(x) * 100); }

export function verdictFromScore(suspiciousProb) {
  if (suspiciousProb >= 0.8) return 'likely fake / high risk';
  if (suspiciousProb >= 0.6) return 'unclear / moderate risk';
  if (suspiciousProb >= 0.4) return 'unclear / low-to-moderate risk';
  return 'likely real / low risk';
}
