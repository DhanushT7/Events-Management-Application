import MailSettings from "../../../shared/models/mailSettingsModel.js";
import { encryptSecret, getMailerCredentials } from "../../../shared/utils/mailerConfig.js";

const ensureAdmin = (req) => req.user && req.user.role === "admin";

export const getMailSettings = async (req, res) => {
  if (!ensureAdmin(req)) {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const dbSettings = await MailSettings.findOne().sort({ updatedAt: -1 }).lean();
    const creds = await getMailerCredentials();

    return res.status(200).json({
      fromEmail: dbSettings?.fromEmail || creds.from || "",
      hasAppPassword: Boolean(dbSettings?.encryptedAppPassword || creds.pass),
      source: dbSettings ? "admin" : "env",
      displayName: dbSettings?.displayName || creds.displayName || "Events Mailer",
      service: dbSettings?.service || creds.service || "gmail",
      updatedAt: dbSettings?.updatedAt || null,
    });
  } catch (error) {
    console.error("Error fetching mail settings", error);
    return res.status(500).json({ message: "Unable to load mail settings" });
  }
};

export const upsertMailSettings = async (req, res) => {
  if (!ensureAdmin(req)) {
    return res.status(403).json({ message: "Admin access required" });
  }

  const { fromEmail, appPassword, displayName, service } = req.body || {};

  if (!fromEmail || !appPassword) {
    return res.status(400).json({ message: "fromEmail and appPassword are required" });
  }

  try {
    const encryptedAppPassword = encryptSecret(appPassword);
    const record = await MailSettings.findOneAndUpdate(
      {},
      {
        fromEmail,
        encryptedAppPassword,
        displayName: displayName || fromEmail,
        service: service || "gmail",
        updatedBy: req.user?.email || "admin",
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Mail settings saved",
      fromEmail: record.fromEmail,
      updatedAt: record.updatedAt,
      source: "admin",
    });
  } catch (error) {
    console.error("Error saving mail settings", error);
    return res.status(500).json({ message: "Unable to save mail settings" });
  }
};
