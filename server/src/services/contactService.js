import { env } from "../config/env.js";

/**
 * Environment-aware contact-delivery abstraction. No email provider is
 * installed or configured yet (CONTENT_CHECKLIST.md has no confirmed
 * provider/credentials), so this module never claims delivery it cannot
 * perform:
 *
 * - development/test: simulates delivery and logs a redacted summary only.
 * - production with CONTACT_PROVIDER + CONTACT_RECIPIENT_EMAIL configured:
 *   would call the real provider (not implemented — no provider chosen yet).
 * - production without a configured provider: returns `delivered: false`
 *   with `reason: "provider-unavailable"` so the controller can respond
 *   honestly instead of faking success.
 *
 * Swapping in Resend/Nodemailer later means implementing `sendViaProvider`
 * below — the controller and route never need to change.
 */

function redactEmail(email) {
  const [local, domain] = email.split("@");
  if (!domain) return "unknown";
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}

async function sendViaProvider(_message) {
  // No provider is configured/verified for this portfolio yet
  // (server/.env.example: CONTACT_PROVIDER=). Implement here once one is
  // chosen — the controller's contract (a resolved { delivered } object)
  // does not need to change.
  throw new Error("No contact provider is implemented yet.");
}

/**
 * @param {{ name: string, email: string, subject: string, message: string }} contactMessage
 * @returns {Promise<{ delivered: boolean, simulated: boolean, reason?: string }>}
 */
export async function deliverContactMessage(contactMessage) {
  const isProduction = env.nodeEnv === "production";
  const providerConfigured = Boolean(
    env.contactProvider && env.contactRecipientEmail,
  );

  if (!isProduction) {
    console.log(
      `[contact] simulated delivery — subject="${contactMessage.subject}" from=${redactEmail(contactMessage.email)}`,
    );
    return { delivered: true, simulated: true };
  }

  if (!providerConfigured) {
    console.error(
      "[contact] delivery attempted in production with no CONTACT_PROVIDER/CONTACT_RECIPIENT_EMAIL configured — refusing to claim success.",
    );
    return {
      delivered: false,
      simulated: false,
      reason: "provider-unavailable",
    };
  }

  try {
    await sendViaProvider(contactMessage);
    return { delivered: true, simulated: false };
  } catch (error) {
    console.error(
      `[contact] provider delivery failed: ${error.message || "unknown error"}`,
    );
    return { delivered: false, simulated: false, reason: "provider-error" };
  }
}
