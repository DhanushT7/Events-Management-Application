import mongoose from "mongoose";

const mailSettingsSchema = mongoose.Schema(
  {
    fromEmail: {
      type: String,
      required: true,
    },
    encryptedAppPassword: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      default: "Events Mailer",
    },
    service: {
      type: String,
      default: "gmail",
    },
    updatedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const MailSettings = mongoose.model("MailSettings", mailSettingsSchema);
export default MailSettings;
