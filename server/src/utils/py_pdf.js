import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PY_BIN = (process.env.PYTHON_BIN || 'python').split(' ');

export function pyExtractPdfText(b64, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const script = path.resolve(__dirname, '../../python/extract_pdf.py');
    const child = spawn(PY_BIN[0], [...PY_BIN.slice(1), script], {
      stdio: ['pipe','pipe','pipe'],
      env: process.env
    });

    let out = '', err = '';
    const t = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('extract_pdf timeout')); }, timeoutMs);

    child.stdout.on('data', d => out += d.toString());
    child.stderr.on('data', d => err += d.toString());
    child.on('close', code => {
      clearTimeout(t);
      if (code !== 0 && err) return reject(new Error(err || `python exited ${code}`));
      try {
        const parsed = JSON.parse(out || '{}');
        resolve(parsed);
      } catch {
        reject(new Error('bad JSON from extract_pdf: ' + out));
      }
    });

    child.stdin.write(JSON.stringify({ b64 }));
    child.stdin.end();
  });
}
