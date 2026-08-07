import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  contactRecipientEmail: process.env.CONTACT_RECIPIENT_EMAIL || "",
  contactProvider: process.env.CONTACT_PROVIDER || "",
};
