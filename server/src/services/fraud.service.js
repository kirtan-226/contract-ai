// Regex + heuristics. Return flags + an aggregate score 0..1

const RULES = [
  { re: /\b(as\s+is|no\s+warranty|without\s+warranty)\b/i, sev: 2, desc: 'Warranty disclaimer' },
  { re: /\b(automatic\s+renewal|auto\-renew)\b/i, sev: 2, desc: 'Auto-renewal' },
  { re: /\b(non\-refundable|no\s+refund)\b/i, sev: 2, desc: 'Non-refundable terms' },
  { re: /\b(arbitration|binding\s+arbitration)\b/i, sev: 1, desc: 'Arbitration requirement' },
  { re: /\b(wire\s+transfer|gift\s+card|crypto)\b/i, sev: 3, desc: 'Suspicious payment method' },
  { re: /\b(urgent|act\s+now|immediately)\b/i, sev: 1, desc: 'Urgency language' },
  { re: /\b(sign\s+without\s+review|do\s+not\s+consult)\b/i, sev: 3, desc: 'Discourages review' },
  // Housing-specific quick checks:
  { re: /\bsecurity\s+deposit\b/i, sev: 1, desc: 'Security deposit clause' },
  { re: /\bkeys?\s+fee\b/i, sev: 2, desc: 'Key fee (potential junk fee)' },
  { re: /\butilities?\s+included\b/i, sev: 0, desc: 'Utilities wording' },
];

export function checkPatterns(text) {
  const flags = [];
  for (const r of RULES) {
    if (r.re.test(text)) flags.push({ description: r.desc, severity: r.sev });
  }
  const sevSum = flags.reduce((s, f) => s + f.severity, 0);
  // normalize: assume max “typical” sev ~ 10
  const score = Math.max(0, Math.min(1, sevSum / 10));
  return { flags, score };
}
