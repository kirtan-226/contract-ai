import { Router } from 'express';
import { startAnalysis, answerQuestions } from '../controllers/analysis.controller.js';

const router = Router();

router.post('/start', startAnalysis);
router.post('/answer', answerQuestions);

export default router;
