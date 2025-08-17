import express from 'express';
import cors from 'cors';
import analysisRoutes from './routes/analysis.routes.js';

const app = express();
app.use(cors());

// Let Multer handle multipart; don't pre-parse it as text.
app.use((req, res, next) => {
  if (req.is('application/json') || req.is('application/*+json')) {
    return express.json({ limit: '10mb' })(req, res, next);
  }
  if (req.is('multipart/form-data')) {
    return next(); // IMPORTANT: do not parse here; Multer will.
  }
  // Everything else → allow raw text posts
  return express.text({ type: '*/*', limit: '10mb' })(req, res, next);
});

app.use('/api', analysisRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));
export default app;
