import express from 'express';
import registerUser from '../controllers/registerControllers.js';
import loginUser from '../controllers/loginControllers.js';
import { sendResetOtp, verifyResetOtp, resetPasswordWithOtp } from "../controllers/passwordOtpController.js";
import { forgotPasswordDummy } from "../controllers/forgotPasswordDummyController.js";
import { getMailSettings, upsertMailSettings } from "../controllers/mailSettingsController.js";
import authMiddleware from "../../../shared/middleware/authMiddleware.js";

const router = express.Router();

const requireAdmin = (req, res, next) => {
	if (!req.user || req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Admin access required' });
	}
	next();
};

router.post('/login', loginUser);
router.post('/register', registerUser);

// OTP-based password reset flow
router.post("/forgot-password", sendResetOtp);
router.post("/forgot-password/verify", verifyResetOtp);
router.post("/forgot-password/reset", resetPasswordWithOtp);

// Legacy dummy endpoints (kept for backward compatibility)
router.post("/forgot-password-dummy", forgotPasswordDummy);

// Admin mail settings
router.get("/admin/mail-settings", authMiddleware, requireAdmin, getMailSettings);
router.post("/admin/mail-settings", authMiddleware, requireAdmin, upsertMailSettings);

export default router;
