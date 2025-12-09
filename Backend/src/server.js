import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import shared modules
import db from './shared/config/db.js';
import { initializeDataValidation } from './shared/middleware/dataValidationMiddleware.js';

// Import feature routes directly
import authRoutes from './features/auth/routes/authRoutes.js';
import participantRoutes from './features/participants/routes/participantRoutes.js';
import coordinatorRoutes from './features/events/routes/coordinatorRoutes.js';
import hodRoutes from './features/events/routes/hodRoutes.js';
import claimItemRoutes from './features/claims/routes/claimItemRoutes.js';
import budgetSyncRoutes from './features/claims/routes/budgetSyncRoutes.js';
import certificateRoutes from './features/certificates/routes/certificateRoutes.js';
import brochureRoutes from './features/documents/routes/brochureRoutes.js';
import adminRoutes from './features/admin/routes/adminRoutes.js';
import adminExportsRouter from './features/admin/routes/adminExports.js';
import debugRoutes from './features/debug/routes/debugRoutes.js';
import { createDefaultAdmin } from './features/admin/controllers/adminAuthController.js';
import eventsRoutes from './features/events/routes/eventsRoutes.js';
import adminEventsHistoryRouter from './features/admin/routes/adminEventsHistory.js';
import feedbackTemplateRoutes from './features/feedback/routes/templateRoutes.js';
import feedbackAnalysisRoutes from './features/feedback/routes/analysisRoutes.js';
import { ensureDefaultFeedbackTemplate } from './shared/services/feedbackTemplateService.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv to look for .env file in the Backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
db.connectDb();
ensureDefaultFeedbackTemplate().catch((error) => {
  console.error('Failed to initialize default feedback template:', error.message);
});

// Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/participant", participantRoutes);
app.use("/api/coordinator", coordinatorRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/claims", claimItemRoutes);
app.use("/api/budget-sync", budgetSyncRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/brochures", brochureRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminExportsRouter);
app.use("/api/admin", adminEventsHistoryRouter);
app.use("/api/debug", debugRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/coordinator/template", feedbackTemplateRoutes);
app.use("/api/coordinator/template-analysis", feedbackAnalysisRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Create default admin if none exists
  try {
    await createDefaultAdmin();
  } catch (error) {
    console.error('Error creating default admin:', error);
  }

  // Initialize data validation after server starts
  initializeDataValidation({
    runOnStartup: true,
    intervalMinutes: 60, // Run every hour
    autoFix: false // Set to true if you want automatic fixes
  });
});