import express from 'express';
import cors from 'cors';
import analysisRoutes from './routes/analysis.routes.js';

const app = express();

// CORS
app.use(cors());

// Flexible body parser:
// - If content-type is JSON → parse JSON
// - Otherwise treat as text (so you can POST raw contract text if needed)
app.use((req, res, next) => {
  if (req.is('application/json') || req.is('application/*+json')) {
    return express.json({ limit: '2mb' })(req, res, next);
  }
  return express.text({ type: '*/*', limit: '2mb' })(req, res, next);
});

// (optional) quick logger to see what reaches controllers
app.use((req, _res, next) => {
  console.log('CT:', req.headers['content-type'], '| typeof body:', typeof req.body, '|', req.method, req.url);
  next();
});

app.use('/api', analysisRoutes);

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

export default app;
