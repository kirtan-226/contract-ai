import { callLLMRaw } from '../services/llm.service.js';
import { runPythonContractCheck } from '../utils/python_check.js';
import { buildRiskPrompt, buildHousingPrompt } from '../utils/prompts.js';

// text only
async function readText(req) {
  const raw = req.body;
  return typeof raw === 'string' ? raw : raw?.text || '';
}

export async function startAnalysis(req, res) {
  try {
    const contract = await readText(req);
    if (!contract || contract.trim().length < 40) {
      return res.status(400).json({ error: 'Provide contract text (>=40 chars).' });
    }

    // 1) precheck (python heuristic)
    const py = await runPythonContractCheck(contract);

    // 2) If NOT a contract by heuristic → ask LLM to judge as housing lease (raw)
    if (!py?.is_contract || (py?.score ?? 0) < 0.55) {
      const prompt = buildHousingPrompt(contract);
      const { output } = await callLLMRaw(prompt);
      return res.json({ prompt, output });
    }

    // 3) Looks like a contract → ask LLM risk (raw)
    const prompt = buildRiskPrompt({ contract });
    const { output } = await callLLMRaw(prompt);
    return res.json({ prompt, output });

  } catch (e) {
    console.error('startAnalysis error:', e);
    return res.status(500).json({ error: 'Failed to start analysis.' });
  }
}

export async function answerQuestions(req, res) {
  try {
    // keep simple: require contract text directly
    const contract = typeof req.body === 'string' ? req.body : req.body?.contract;
    if (!contract || contract.trim().length < 40) {
      return res.status(400).json({ error: 'Provide contract text (>=40 chars).' });
    }

    const prompt = buildRiskPrompt({ contract });
    const { output } = await callLLMRaw(prompt);
    return res.json({ prompt, output });

  } catch (e) {
    console.error('answerQuestions error:', e);
    return res.status(500).json({ error: 'Failed to continue analysis.' });
  }
}
