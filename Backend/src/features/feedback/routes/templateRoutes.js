import express from 'express';
import authMiddleware from '../../../shared/middleware/authMiddleware.js';
import {
  saveTemplate,
  setTemplateLock,
  cloneTemplateFromEvent,
  getTemplateVersions,
  restoreTemplateVersion,
  getEventFeedbackTemplate
} from '../controllers/templateController.js';

const router = express.Router();

// Get current template
router.get('/:eventId', authMiddleware, getEventFeedbackTemplate);
// Save/update template (creates version snapshot)
router.post('/:eventId', authMiddleware, saveTemplate);
// Lock/unlock
router.post('/:eventId/lock', authMiddleware, setTemplateLock);
// Clone from another event
router.post('/:eventId/clone', authMiddleware, cloneTemplateFromEvent);
// Versions
router.get('/:eventId/versions', authMiddleware, getTemplateVersions);
router.post('/:eventId/versions/:versionId/restore', authMiddleware, restoreTemplateVersion);

export default router;
