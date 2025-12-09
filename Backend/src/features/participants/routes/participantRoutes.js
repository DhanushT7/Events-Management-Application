import express from 'express';
import authMiddleware from '../../../shared/middleware/authMiddleware.js';
import { authorizeRoles, authorizeParticipantSelfAccess } from '../../../shared/middleware/roleAuthMiddleware.js';
import * as participantController from '../controllers/dashboard.js';

const router = express.Router();

// Apply authentication middleware to all participant routes
router.use(authMiddleware);

// Event routes - accessible to all authenticated users
router.get('/events', participantController.getEvents);
router.post('/register', authorizeRoles('participant'), participantController.registerEvent);

// Participant-specific routes with self-access authorization
router.get('/my-events/:participantId', authorizeParticipantSelfAccess('participantId'), participantController.getMyEvents);
router.get('/my-events/all', authorizeRoles('hod', 'admin'), participantController.getAllMyEvents);

// Certificate routes with proper authorization
router.get('/certificates/:participantId', authorizeParticipantSelfAccess('participantId'), participantController.getCertificates);
router.get('/my-certificates/:participantId', authorizeParticipantSelfAccess('participantId'), participantController.getMyCertificates); // Keep for backward compatibility
router.get('/download-certificate/:certificateId', participantController.downloadCertificate);
router.get('/verify-certificate/:certificateId', participantController.verifyCertificate); // Public route for verification

// Enhanced certificate viewing routes
router.get('/certificate-preview/:certificateId', participantController.getCertificatePreview);
router.get('/certificate-image/:certificateId', participantController.getCertificateImagePreview);

// Feedback routes
router.get('/feedback-questions', participantController.getFeedbackQuestions);
router.post('/feedback', authorizeRoles('participant'), participantController.giveFeedback);
router.get('/events/:eventId/feedback-template', authorizeRoles('participant'), participantController.getEventFeedbackTemplate);

// Activity and notifications with self-access authorization
router.get('/recent-activity/:participantId', authorizeParticipantSelfAccess('participantId'), participantController.getRecentActivity);
router.get('/notifications/:participantId', authorizeParticipantSelfAccess('participantId'), participantController.getNotifications);

// Profile management with self-access authorization
router.put('/profile/:participantId', authorizeParticipantSelfAccess('participantId'), participantController.updateProfile);
router.put('/change-password', authorizeRoles('participant', 'coordinator', 'hod', 'admin'), participantController.changePassword);
router.put('/preferences/:participantId', authorizeParticipantSelfAccess('participantId'), participantController.updatePreferences);

export default router;