import { Router } from 'express';
import multer from 'multer';
import { startAnalysis, answerQuestions, startAnalysisPdf } from '../controllers/analysis.controller.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

router.post('/start', startAnalysis);
router.post('/answer', answerQuestions);
router.post('/start-pdf', upload.single('file'), startAnalysisPdf);

export default router;
