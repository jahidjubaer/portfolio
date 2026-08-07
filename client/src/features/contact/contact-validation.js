/**
 * Hand-written contact-form validation — no React Hook Form/Zod. Mirrors
 * the limits in server/src/utils/contactValidation.js so client and server
 * never disagree about what counts as valid.
 */

export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  subject: { min: 2, max: 120 },
  message: { min: 10, max: 2000 },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {{ name: string, email: string, subject: string, message: string, companyWebsite?: string }} values
 * @returns {Record<string, string>} field-level errors, empty when valid
 */
export function validateContactForm(values) {
  const errors = {};

  const name = (values.name ?? "").trim();
  if (!name) {
    errors.name = "Enter your name.";
  } else if (name.length < CONTACT_LIMITS.name.min) {
    errors.name = "Enter your full name.";
  } else if (name.length > CONTACT_LIMITS.name.max) {
    errors.name = "Name is too long.";
  }

  const email = (values.email ?? "").trim();
  if (!email) {
    errors.email = "Enter your email address.";
  } else if (email.length > CONTACT_LIMITS.email.max) {
    errors.email = "Email address is too long.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  const subject = (values.subject ?? "").trim();
  if (!subject) {
    errors.subject = "Enter a subject.";
  } else if (subject.length < CONTACT_LIMITS.subject.min) {
    errors.subject = "Subject is too short.";
  } else if (subject.length > CONTACT_LIMITS.subject.max) {
    errors.subject = "Subject is too long.";
  }

  const message = (values.message ?? "").trim();
  if (!message) {
    errors.message = "Enter a message.";
  } else if (message.length < CONTACT_LIMITS.message.min) {
    errors.message = "Message is too short.";
  } else if (message.length > CONTACT_LIMITS.message.max) {
    errors.message = "Message is too long.";
  }

  return errors;
}

export function isContactFormValid(values) {
  return Object.keys(validateContactForm(values)).length === 0;
}
