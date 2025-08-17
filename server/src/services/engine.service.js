import { checkPatterns } from './fraud.service.js';
import { matchTemplates } from './template.service.js';
import { evaluateWithLLM } from './llm.service.js';
import { weightScore, verdictFromScore, toPercent } from '../utils/scoring.js';

export async function runEngine(contractText, answers) {
  const fraud = checkPatterns(contractText);               // { flags[], score }
  const tmpl  = matchTemplates(contractText);              // { name, score } | null
  const llm   = await evaluateWithLLM(contractText, fraud.flags, tmpl, answers); // {score, rationale, ...}

  const parts = {
    fraud: fraud.score,
    template: tmpl?.score ?? 0,
    llm: llm.score,
  };
  const suspiciousProb = weightScore(parts); // 0..1
  const report = {
    verdict: verdictFromScore(suspiciousProb),
    confidence: toPercent(suspiciousProb),
    templateSimilarity: tmpl ? `${tmpl.name} ${toPercent(tmpl.score)}%` : 'unknown',
    fraudSignals: fraud.flags,
    llm,
  };

  return {
    suspiciousProb,
    fraud, template: tmpl, llm,
    report,
  };
}
