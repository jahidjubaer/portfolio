import { env } from "../config/env.js";

/**
 * Environment-aware contact-delivery abstraction. CONTENT_CHECKLIST.md
 * section 3 names Web3Forms as the intended contact-form provider. The
 * adapter below is fully implemented, but stays inactive until a real
 * WEB3FORMS_ACCESS_KEY is configured — this module never claims delivery
 * it cannot perform:
 *
 * - development/test: simulates delivery and logs a redacted summary only.
 * - production with CONTACT_PROVIDER=web3forms + CONTACT_RECIPIENT_EMAIL +
 *   WEB3FORMS_ACCESS_KEY all configured: submits via the Web3Forms API.
 * - production with an incomplete or unrecognized provider configuration:
 *   returns `delivered: false` with `reason: "provider-unavailable"` so the
 *   controller can respond honestly instead of faking success.
 *
 * Swapping to a different provider later means implementing another branch
 * in `sendViaProvider` — the controller and route never need to change.
 */

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const WEB3FORMS_TIMEOUT_MS = 8000;

function redactEmail(email) {
  const [local, domain] = email.split("@");
  if (!domain) return "unknown";
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}

/**
 * Submits the message to Web3Forms. Never logs the access key, the full
 * message body, or the sender's full email — only a resolved/thrown result.
 * @param {{ name: string, email: string, subject: string, message: string }} contactMessage
 */
async function sendViaWeb3Forms(contactMessage) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEB3FORMS_TIMEOUT_MS);

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: env.web3formsAccessKey,
        subject: contactMessage.subject,
        from_name: contactMessage.name,
        email: contactMessage.email,
        message: contactMessage.message,
        to: env.contactRecipientEmail,
      }),
      signal: controller.signal,
    });

    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.success) {
      throw new Error(`Web3Forms responded with status ${response.status}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * @param {{ name: string, email: string, subject: string, message: string }} contactMessage
 */
async function sendViaProvider(contactMessage) {
  if (env.contactProvider === "web3forms") {
    await sendViaWeb3Forms(contactMessage);
    return;
  }
  throw new Error(
    `No implementation for contact provider "${env.contactProvider}".`,
  );
}

/**
 * A provider is only considered ready once every field it actually needs is
 * present — for Web3Forms specifically, that includes the access key.
 */
function isProviderReady() {
  if (!env.contactProvider || !env.contactRecipientEmail) return false;
  if (env.contactProvider === "web3forms")
    return Boolean(env.web3formsAccessKey);
  return true;
}

/**
 * @param {{ name: string, email: string, subject: string, message: string }} contactMessage
 * @returns {Promise<{ delivered: boolean, simulated: boolean, reason?: string }>}
 */
export async function deliverContactMessage(contactMessage) {
  const isProduction = env.nodeEnv === "production";

  if (!isProduction) {
    console.log(
      `[contact] simulated delivery — subject="${contactMessage.subject}" from=${redactEmail(contactMessage.email)}`,
    );
    return { delivered: true, simulated: true };
  }

  if (!isProviderReady()) {
    console.error(
      "[contact] delivery attempted in production with an incomplete contact-provider configuration — refusing to claim success.",
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
