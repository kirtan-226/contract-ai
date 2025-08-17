export const PORT = Number(process.env.PORT || 8080);
export const MODEL_PROVIDER = process.env.MODEL_PROVIDER || 'hf'; // 'hf' | 'openai'
export const MODEL_NAME = process.env.MODEL_NAME || 'openai/gpt-oss-20b';
export const HF_TOKEN = process.env.HF_TOKEN || '';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
