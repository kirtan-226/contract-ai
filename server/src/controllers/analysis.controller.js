import { callLLMRaw } from '../services/llm.service.js';
import { runPythonContractCheck } from '../utils/python_check.js';
import { buildRiskPrompt, buildHousingPrompt } from '../utils/prompts.js';
import { pyExtractPdfText } from '../utils/py_pdf.js';

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

export async function startAnalysisPdf(req, res) {
  try {
    const file = req.file; // set by Multer
    if (!file) {
      return res.status(400).json({ error: 'Upload a PDF file under field "file".' });
    }
    // Some browsers send application/pdf, some might send application/octet-stream
    const mt = String(file.mimetype || '');
    if (!mt.includes('pdf')) {
      return res.status(400).json({ error: `Unsupported type: ${mt}. Please upload a PDF.` });
    }

    const b64 = file.buffer.toString('base64');
    const { text, error } = await pyExtractPdfText(b64);
    if (error) return res.status(400).json({ error: 'PDF extract failed: ' + error });

    if (!text || text.trim().length < 40) {
      return res.status(400).json({ error: 'Could not extract sufficient text from PDF.' });
    }

    // Reuse your existing heuristic + prompt path
    const py = await runPythonContractCheck(text);
    const prompt = (!py?.is_contract || (py?.score ?? 0) < 0.55)
      ? buildHousingPrompt(text)
      : buildRiskPrompt({ contract: text });

    const { output } = await callLLMRaw(prompt);
    return res.json({ prompt, output, extractedChars: text.length });
  } catch (e) {
    console.error('startAnalysisPdf error:', e);
    return res.status(500).json({ error: 'Failed to analyze PDF.' });
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
