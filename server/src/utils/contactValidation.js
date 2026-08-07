/**
 * Hand-written contact-form validation — no Zod/Joi/express-validator.
 * Mirrors the limits in client/src/features/contact/contact-validation.js
 * so client and server never disagree about what counts as valid.
 */

export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  subject: { min: 2, max: 120 },
  message: { min: 10, max: 2000 },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isPlainString(value) {
  return typeof value === "string";
}

function trimmedOrNull(value) {
  return isPlainString(value) ? value.trim() : null;
}

/**
 * @param {unknown} payload
 * @returns {{ valid: boolean, errors: Record<string, string>, value: { name: string, email: string, subject: string, message: string } | null }}
 */
export function validateContactPayload(payload) {
  const errors = {};
  const body = payload && typeof payload === "object" ? payload : {};

  // A populated honeypot never produces a field error — it is reported
  // separately via `isSpam` so the controller can respond as if the
  // submission succeeded, without telling a bot what tripped it.
  const honeypotValue = trimmedOrNull(body.companyWebsite) ?? "";
  const isSpam = honeypotValue.length > 0;

  const name = trimmedOrNull(body.name);
  if (!name) {
    errors.name = "Enter your name.";
  } else if (name.length < CONTACT_LIMITS.name.min) {
    errors.name = "Enter your full name.";
  } else if (name.length > CONTACT_LIMITS.name.max) {
    errors.name = "Name is too long.";
  }

  const emailRaw = trimmedOrNull(body.email);
  const email = emailRaw ? emailRaw.toLowerCase() : null;
  if (!email) {
    errors.email = "Enter your email address.";
  } else if (email.length > CONTACT_LIMITS.email.max) {
    errors.email = "Email address is too long.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  const subject = trimmedOrNull(body.subject);
  if (!subject) {
    errors.subject = "Enter a subject.";
  } else if (subject.length < CONTACT_LIMITS.subject.min) {
    errors.subject = "Subject is too short.";
  } else if (subject.length > CONTACT_LIMITS.subject.max) {
    errors.subject = "Subject is too long.";
  }

  const message = trimmedOrNull(body.message);
  if (!message) {
    errors.message = "Enter a message.";
  } else if (message.length < CONTACT_LIMITS.message.min) {
    errors.message = "Message is too short.";
  } else if (message.length > CONTACT_LIMITS.message.max) {
    errors.message = "Message is too long.";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors, value: null, isSpam };
  }

  return {
    valid: true,
    errors: {},
    value: { name, email, subject, message },
    isSpam,
  };
}
