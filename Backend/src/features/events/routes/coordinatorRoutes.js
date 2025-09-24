import express from 'express';
import authMiddleware from '../../../shared/middleware/authMiddleware.js';
import { authorizeRoles, authorizeEventCoordinator, authorizeResourceOwnership } from '../../../shared/middleware/roleAuthMiddleware.js';
import { handleClaimBillSubmission } from '../controllers/dashboard.js';
import { downloadClaimPDF } from '../controllers/downloadClaimPDF.js';
import { generateBrochurePDF, downloadBrochurePDF, saveBrochurePDF } from '../../documents/controllers/brochureController.js';
import {
  createProgramme,
  getProgrammes,
  getProgrammeById,
  updateProgramme,
  deleteProgramme,
  generateProgrammePDF,
  getHod
} from '../controllers/dashboard.js';
import {
  updateOrganizingCommittee,
  getAvailableCommitteeMembers,
  addCommitteeMember,
  updateRegistrationProcedure
} from '../controllers/programmeController.js';
import {
  generateClaimBillPDF,
  generateFundTransferRequestPDF
} from '../../claims/controllers/claimPdfController.js';
// Import claim management controllers
import {
  submitClaim,
  getCoordinatorClaims,
  getClaimById,
  updateClaimStatus,
  getClaimStatistics,
  getEventClaims
} from '../../claims/controllers/claimController.js';
// Import fix amount controller
import {
  fixEventAmountFields,
  fixAllEventsAmountFields
} from '../../claims/controllers/fixAmountController.js';
// Import participant management controllers
import {
  getParticipants,
  getEventParticipants,
  addParticipant,
  addMultipleParticipants,
  approveParticipant,
  bulkApproveParticipants,
  uploadParticipants,
  generateTemplate,
  updateParticipant,
  deleteParticipant,
  exportParticipants,
  markAttendance,
  bulkMarkAttendance,
  rejectParticipant,
  getAttendanceStats
} from '../../participants/controllers/participantManagement.js';
// Import feedback stats controllers
import {
  getEventFeedbackStats,
  getEventFeedbackDetails,
  getAllEventsFeedbackStats
} from '../../feedback/controllers/feedbackStats.js';
// Import organizing committee controllers
import {
  initializeOrganizingCommittee,
  getOrganizingCommittee,
  addOrganizingCommitteeMember,
  updateOrganizingCommitteeMember,
  deleteOrganizingCommitteeMember
} from '../controllers/organizingCommitteeController.js';
// Import models
import event from '../../../shared/models/eventModel.js';
import multer from 'multer';
import { migrateEmbeddedNoteOrder } from '../controllers/budgetSyncController.js';

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const coordinatorRoutes = express.Router();

// Apply authentication middleware to all coordinator routes
coordinatorRoutes.use(authMiddleware);

// Apply coordinator role authorization to all routes except some specific ones
coordinatorRoutes.use((req, res, next) => {
  // Allow HOD and admin to access coordinator routes
  if (req.user.role === 'hod' || req.user.role === 'admin' || req.user.role === 'coordinator') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Coordinator, HOD, or Admin role required"
  });
});

coordinatorRoutes.get('/getHOD', getHod);

// Import profile controller
import { getProfileStats, updateProfile, getProfile, changePassword } from '../controllers/profileController.js';

// Profile management routes
coordinatorRoutes.get('/profile/stats', getProfileStats);
coordinatorRoutes.get('/profile', getProfile);
coordinatorRoutes.put('/profile', updateProfile);
coordinatorRoutes.put('/change-password', changePassword);

coordinatorRoutes.route('/programmes')
  .get(getProgrammes)
  .post(authorizeRoles('coordinator', 'admin'), upload.single('brochure'), createProgramme);

coordinatorRoutes.route('/programmes/:id')
  .get(getProgrammeById)
  .put(authorizeResourceOwnership('event', 'id'), upload.single('brochure'), updateProgramme)
  .delete(authorizeResourceOwnership('event', 'id'), deleteProgramme);

// Add the PDF routes with proper authorization
// PDF routes are accessible to coordinators, HODs, and admins
coordinatorRoutes.get('/programmes/:id/pdf', generateProgrammePDF);
coordinatorRoutes.get('/event/claimPdf/:eventId', downloadClaimPDF);
coordinatorRoutes.post('/claims/:id', authorizeResourceOwnership('event', 'id'), handleClaimBillSubmission);
coordinatorRoutes.post('/programmes/:id/claim', authorizeResourceOwnership('event', 'id'), handleClaimBillSubmission);
coordinatorRoutes.get('/claims/:id/pdf', generateClaimBillPDF);
coordinatorRoutes.get('/claims/:id/fund-transfer-pdf', generateFundTransferRequestPDF);

// Brochure PDF routes with authorization
coordinatorRoutes.get('/brochures/:id/pdf', generateBrochurePDF);
coordinatorRoutes.get('/brochures/:eventId/download', downloadBrochurePDF);
coordinatorRoutes.post('/brochures/:id/save', authorizeResourceOwnership('event', 'id'), upload.single('brochurePDF'), saveBrochurePDF);

// Enhanced Brochure Generation Routes
import {
  generateAdvancedBrochurePDF,
} from '../controllers/programmeController.js';

coordinatorRoutes.get('/programmes/:id/brochure/advanced', generateAdvancedBrochurePDF);

// Participant Management Routes with proper authorization
coordinatorRoutes.get('/participants', getParticipants);
coordinatorRoutes.get('/participants/event/:eventId', authorizeEventCoordinator('eventId'), getEventParticipants);
coordinatorRoutes.get('/events/:eventId/participants', authorizeEventCoordinator('eventId'), getEventParticipants); // Alias for the frontend
coordinatorRoutes.post('/participants/add', addParticipant);
coordinatorRoutes.post('/participants/add-multiple', addMultipleParticipants);
coordinatorRoutes.put('/participants/approve', approveParticipant);
coordinatorRoutes.put('/participants/reject', rejectParticipant);
coordinatorRoutes.put('/participants/bulk-approve', bulkApproveParticipants);
coordinatorRoutes.put('/participants/attendance', markAttendance);
coordinatorRoutes.put('/participants/bulk-attendance', bulkMarkAttendance);
coordinatorRoutes.get('/participants/attendance-stats/:eventId', authorizeEventCoordinator('eventId'), getAttendanceStats);
coordinatorRoutes.post('/participants/upload', upload.single('file'), uploadParticipants);
coordinatorRoutes.get('/participants/template', generateTemplate);
coordinatorRoutes.put('/participants/:participantId', updateParticipant);
coordinatorRoutes.delete('/participants/:participantId', deleteParticipant);
coordinatorRoutes.get('/participants/export/:eventId', authorizeEventCoordinator('eventId'), exportParticipants);

// Feedback Statistics Routes with proper authorization
coordinatorRoutes.get('/feedback/stats/:eventId', authorizeEventCoordinator('eventId'), getEventFeedbackStats);
coordinatorRoutes.get('/feedback/details/:eventId', authorizeEventCoordinator('eventId'), getEventFeedbackDetails);
coordinatorRoutes.get('/feedback/all-events-stats', authorizeRoles('hod', 'admin'), getAllEventsFeedbackStats);

// Organizing Committee Routes with authorization
coordinatorRoutes.get('/organizing-committee', getOrganizingCommittee);
coordinatorRoutes.post('/organizing-committee/initialize', authorizeRoles('coordinator', 'admin'), initializeOrganizingCommittee);
coordinatorRoutes.post('/organizing-committee', authorizeRoles('coordinator', 'admin'), addOrganizingCommitteeMember);
coordinatorRoutes.put('/organizing-committee/:id', authorizeRoles('coordinator', 'admin'), updateOrganizingCommitteeMember);
coordinatorRoutes.delete('/organizing-committee/:id', authorizeRoles('coordinator', 'admin'), deleteOrganizingCommitteeMember);

// Enhanced Event Management Routes
coordinatorRoutes.get('/committee-members', getAvailableCommitteeMembers);
coordinatorRoutes.post('/committee-members', authorizeRoles('coordinator', 'admin'), addCommitteeMember);
coordinatorRoutes.put('/events/:eventId/organizing-committee', authorizeEventCoordinator('eventId'), updateOrganizingCommittee);
coordinatorRoutes.put('/events/:eventId/registration-procedure', authorizeEventCoordinator('eventId'), updateRegistrationProcedure);

// Claim Management Routes with proper authorization
coordinatorRoutes.get('/claims', getCoordinatorClaims);
coordinatorRoutes.get('/claims/statistics', getClaimStatistics);
coordinatorRoutes.post('/events/:eventId/claims', authorizeEventCoordinator('eventId'), upload.array('receipts'), submitClaim);
coordinatorRoutes.get('/events/:eventId/claims', authorizeEventCoordinator('eventId'), getEventClaims);
coordinatorRoutes.get('/claims/:claimId', getClaimById);
coordinatorRoutes.put('/claims/:claimId/status', updateClaimStatus);

// Fix Amount Fields Routes with authorization
coordinatorRoutes.post('/events/:eventId/fix-amounts', authorizeEventCoordinator('eventId'), fixEventAmountFields);
coordinatorRoutes.post('/fix-all-amounts', authorizeRoles('admin'), fixAllEventsAmountFields);

// Data Validation and Cleanup Routes
coordinatorRoutes.get('/data-validation/check', async (req, res) => {
  try {
    const { validateDataIntegrity } = await import('../utils/dataValidation.js');
    const report = await validateDataIntegrity({ autoFix: false });
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

coordinatorRoutes.post('/data-validation/fix', async (req, res) => {
  try {
    const { validateDataIntegrity } = await import('../utils/dataValidation.js');
    const report = await validateDataIntegrity({ autoFix: true });
    res.json({ success: true, report, message: 'Data validation and cleanup completed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

coordinatorRoutes.get('/data-validation/participants/:eventId', async (req, res) => {
  try {
    const { validateParticipantEvents } = await import('../utils/dataValidation.js');
    const { eventId } = req.params;
    const autoFix = req.query.autoFix === 'true';
    const report = await validateParticipantEvents(autoFix, eventId);
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

coordinatorRoutes.get('/claim-pdf/:id', async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme || !programme.claimBill?.pdf?.data) {
      return res.status(404).json({ message: 'Claim PDF not found' });
    }

    res.setHeader('Content-Type', programme.claimBill.pdf.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${programme.claimBill.pdf.fileName}"`);

    // Write and end safely
    res.write(programme.claimBill.pdf.data);
    res.end();

  } catch (err) {
    console.error('❌ Error serving claim PDF:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error retrieving claim PDF', error: err.message });
    }
  }
});

// Maintenance/Migration route (admin only)
coordinatorRoutes.post('/maintenance/migrate-noteorder', authorizeRoles('admin'), migrateEmbeddedNoteOrder);

export default coordinatorRoutes;