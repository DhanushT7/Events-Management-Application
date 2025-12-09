import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../../../shared/models/userModel.js";
import { buildTransporter } from "../../../shared/utils/mailerConfig.js";

const OTP_EXPIRY_MINUTES = 10;
const SESSION_EXPIRY_MINUTES = 15;
const MAX_OTP_ATTEMPTS = 5;

const otpEmailTemplate = (name, otp) => `
  <div style="margin:0;padding:0;background:#f5f7fb;font-family:'Segoe UI',Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f7fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
            <tr>
              <td style="background:#0b5cab;color:#ffffff;padding:18px 24px;text-align:center;">
                <div style="font-size:18px;font-weight:800;letter-spacing:0.4px;">Anna University</div>
                <div style="font-size:16px;font-weight:700;letter-spacing:0.3px;margin-top:2px;">College of Engineering, Guindy</div>
                <div style="font-size:15px;font-weight:600;letter-spacing:0.2px;margin-top:2px;">Department of Computer Science and Engineering</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;color:#1f2937;">
                <p style="margin:0 0 12px 0;font-size:16px;">Dear ${name || "User"},</p>
                <p style="margin:0 0 12px 0;line-height:1.6;">We received a request to reset the password for your account. Use the One-Time Password (OTP) below to continue. This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
                <div style="margin:20px 0;text-align:center;">
                  <div style="display:inline-block;padding:16px 18px;border-radius:12px;background:#f0f4ff;border:1px dashed #cdd9ed;font-size:28px;letter-spacing:10px;font-weight:800;color:#0b5cab;">${otp}</div>
                </div>
                <p style="margin:0 0 12px 0;line-height:1.6;color:#475569;">If you did not request this action, you may safely ignore this email. No changes will be made unless the OTP is used.</p>
                <p style="margin:0 0 12px 0;line-height:1.6;color:#475569;">For assistance, contact the Event Management Team.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px;background:#f8fafc;color:#42526e;font-size:13px;line-height:1.5;">
                <div style="font-weight:600;">Regards,</div>
                <div>Event Management Team</div>
                <div>Department of Computer Science and Engineering (DCSE)</div>
                <div>College of Engineering, Guindy</div>
                <div>Anna University</div>
                <div style="margin-top:10px;color:#8a94a6;font-size:12px;">This is an automated message. Please do not reply.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;

const clearOtpState = (user) => {
  user.resetOtpHash = null;
  user.resetOtpExpires = null;
  user.resetOtpAttempts = 0;
  user.resetOtpSession = null;
  user.resetOtpSessionExpires = null;
  user.resetOtpVerifiedAt = null;
};

export const sendResetOtp = async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: "Email and role are required." });
  }

  try {
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(404).json({ message: "Email not found for this role." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    user.resetOtpHash = otpHash;
    user.resetOtpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    user.resetOtpAttempts = 0;
    user.resetOtpSession = null;
    user.resetOtpSessionExpires = null;
    user.resetOtpVerifiedAt = null;

    await user.save();

    const { transporter, fromAddress } = await buildTransporter();

    // Try verifying the transporter to surface credential issues early
    try {
      await transporter.verify();
    } catch (verifyErr) {
      console.error("[MAIL] Transport verify failed", verifyErr);
    }

    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: "Password Reset – OTP Verification",
      html: otpEmailTemplate(user.name, otp),
      text: `Anna University\nCollege of Engineering, Guindy\nDCSE Event Management System\n\nDear ${user.name || "User"},\n\nYour OTP for password reset: ${otp}\nThis OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.\nIf you did not request this, please ignore this email.\n\nRegards,\nEvent Management Team\nDCSE, CEG, Anna University\n(This is an automated message. Please do not reply.)`,
    });

    console.log("[MAIL] OTP mail queued", {
      to: email,
      messageId: info?.messageId,
      envelope: info?.envelope,
      accepted: info?.accepted,
      rejected: info?.rejected,
      response: info?.response,
    });

    return res.status(200).json({
      message: "OTP sent to your email. Please check your inbox.",
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    console.error("Error sending reset OTP:", error);
    return res.status(500).json({ message: "Unable to send OTP right now. Please try again." });
  }
};

export const verifyResetOtp = async (req, res) => {
  const { email, role, otp } = req.body;
  if (!email || !role || !otp) {
    return res.status(400).json({ message: "Email, role, and OTP are required." });
  }

  try {
    const user = await User.findOne({ email, role });
    if (!user || !user.resetOtpHash) {
      return res.status(400).json({ message: "Please request a new OTP." });
    }

    if (!user.resetOtpExpires || user.resetOtpExpires < new Date()) {
      clearOtpState(user);
      await user.save();
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    if (user.resetOtpAttempts >= MAX_OTP_ATTEMPTS) {
      clearOtpState(user);
      await user.save();
      return res.status(429).json({ message: "Too many attempts. Please request a new OTP." });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOtpHash);
    user.resetOtpAttempts += 1;

    if (!isMatch) {
      await user.save();
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    user.resetOtpVerifiedAt = new Date();
    user.resetOtpSession = crypto.randomBytes(24).toString("hex");
    user.resetOtpSessionExpires = new Date(Date.now() + SESSION_EXPIRY_MINUTES * 60 * 1000);
    user.resetOtpAttempts = 0;

    await user.save();

    return res.status(200).json({
      message: "OTP verified. You can now set a new password.",
      resetToken: user.resetOtpSession,
      tokenExpiresAt: user.resetOtpSessionExpires,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Could not verify OTP. Please try again." });
  }
};

export const resetPasswordWithOtp = async (req, res) => {
  const { email, role, resetToken, newPassword } = req.body;

  if (!email || !role || !resetToken || !newPassword) {
    return res.status(400).json({ message: "Email, role, reset token, and new password are required." });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  try {
    const user = await User.findOne({ email, role });
    if (!user || !user.resetOtpSession || !user.resetOtpSessionExpires) {
      return res.status(400).json({ message: "Reset session not found. Please verify OTP again." });
    }

    if (user.resetOtpSession !== resetToken) {
      return res.status(400).json({ message: "Invalid reset token. Please verify OTP again." });
    }

    if (user.resetOtpSessionExpires < new Date()) {
      clearOtpState(user);
      await user.save();
      return res.status(400).json({ message: "Reset session expired. Please verify OTP again." });
    }

    user.password = newPassword;
    clearOtpState(user);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully. You can now log in." });
  } catch (error) {
    console.error("Error resetting password with OTP:", error);
    return res.status(500).json({ message: "Could not reset password. Please try again." });
  }
};
