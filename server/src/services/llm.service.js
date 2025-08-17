import { pyLLMRaw } from '../utils/py_llm.js';
import { MODEL_PROVIDER, MODEL_NAME } from '../config/env.js';

export async function callLLMRaw(prompt) {
  const out = await pyLLMRaw({ prompt, provider: MODEL_PROVIDER, model: MODEL_NAME });
  return { prompt, output: out?.output ?? '' };
}
