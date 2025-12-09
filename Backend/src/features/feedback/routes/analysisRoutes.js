import express from 'express';
import authMiddleware from '../../../shared/middleware/authMiddleware.js';
import { getTemplateAnalysis } from '../controllers/templateAnalysisController.js';

const router = express.Router();

router.get('/:eventId', authMiddleware, getTemplateAnalysis);

export default router;
