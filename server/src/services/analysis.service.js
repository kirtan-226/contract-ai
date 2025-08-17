import { runEngine } from './engine.service.js';
import { generateClarifiers } from './llm.service.js';
import { clamp01 } from '../utils/scoring.js';

export async function runOneIteration(state) {
  // state: { contract, answers, iterations, maxIter, threshold }
  const engine = await runEngine(state.contract, state.answers);
  const confidence = clamp01(engine.suspiciousProb);
  state.iterations = (state.iterations || 0) + 1;
  state.confidence = confidence;

  const done = (confidence >= (state.threshold ?? 0.8)) || (state.iterations >= (state.maxIter ?? 3));
  if (done) {
    return { done: true, confidence, report: engine.report };
  }

  // ask for clarifications
  const questions = await generateClarifiers(state.contract, engine.fraud.flags, engine.template);
  return {
    done: false,
    confidence,
    questions,
    provider: engine.llm.provider,
    model: engine.llm.model,
  };
}
