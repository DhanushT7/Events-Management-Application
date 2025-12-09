import crypto from "crypto";
import nodemailer from "nodemailer";
import MailSettings from "../models/mailSettingsModel.js";

const ALGORITHM = "aes-256-ctr";

const buildKey = () => {
  const secret = process.env.MAIL_SECRET || process.env.JWT_SECRET || "events-mail-secret";
  return crypto.createHash("sha256").update(secret).digest();
};

export const encryptSecret = (plainText) => {
  if (!plainText) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, buildKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decryptSecret = (cipherText) => {
  if (!cipherText) return null;
  const [ivHex, encryptedHex] = cipherText.split(":");
  if (!ivHex || !encryptedHex) return null;
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, buildKey(), iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
};

export const getMailerCredentials = async () => {
  // Prefer DB settings if available
  const dbSettings = await MailSettings.findOne().sort({ updatedAt: -1 }).lean();
  if (dbSettings) {
    const appPass = decryptSecret(dbSettings.encryptedAppPassword);
    if (appPass) {
      return {
        from: dbSettings.fromEmail,
        user: dbSettings.fromEmail,
        pass: appPass,
        displayName: dbSettings.displayName || dbSettings.fromEmail,
        service: dbSettings.service || "gmail",
      };
    }
  }

  // Fallback to environment variables
  return {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    displayName: process.env.EMAIL_FROM_NAME || "Events Mailer",
    service: process.env.EMAIL_SERVICE || "gmail",
  };
};

export const buildTransporter = async () => {
  const creds = await getMailerCredentials();
  if (!creds.user || !creds.pass) {
    throw new Error("Email credentials are not configured. Please set EMAIL_USER/EMAIL_PASS or admin mail settings.");
  }

  return {
    transporter: nodemailer.createTransport({
      service: creds.service || "gmail",
      auth: {
        user: creds.user,
        pass: creds.pass,
      },
    }),
    fromAddress: `${creds.displayName} <${creds.from}>`,
  };
};

export default {
  encryptSecret,
  decryptSecret,
  getMailerCredentials,
  buildTransporter,
};
