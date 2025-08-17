import { MODEL_NAME, MODEL_PROVIDER } from '../config/env.js';

export function formatNotContract(py) {
  const pct = Math.round(((py?.score ?? 0) * 100));
  return {
    provider: MODEL_PROVIDER,
    model: MODEL_NAME,
    report: {
      verdict: 'Not a contract (skipped LLM)',
      confidence: pct,
      templateSimilarity: 'unknown',
      fraudSignals: [],
      llm: { used: false, score: 0, rationale: ['Gated by Python contract detector'] },
      detector: { source: 'python', score: py?.score ?? 0 },
    },
    ui: {
      title: '❌ Not a contract',
      subtitle: `Python detector score ${pct}% (<55% threshold)`,
      bullets: [
        'The text does not appear to be a formal contract.',
        'LLM analysis skipped to save cost and time.',
      ],
    },
  };
}
