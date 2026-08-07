import { describe, it, expect } from "vitest";
import {
  validateContactForm,
  isContactFormValid,
  CONTACT_LIMITS,
} from "../../../src/features/contact/contact-validation";

const validValues = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Hello",
  message: "I would like to talk about a project.",
};

describe("validateContactForm", () => {
  it("returns no errors for a valid submission", () => {
    expect(validateContactForm(validValues)).toEqual({});
    expect(isContactFormValid(validValues)).toBe(true);
  });

  it("requires every field", () => {
    const errors = validateContactForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    expect(errors).toHaveProperty("name");
    expect(errors).toHaveProperty("email");
    expect(errors).toHaveProperty("subject");
    expect(errors).toHaveProperty("message");
    expect(isContactFormValid({})).toBe(false);
  });

  it("rejects a malformed email", () => {
    const errors = validateContactForm({
      ...validValues,
      email: "not-an-email",
    });
    expect(errors.email).toBeTruthy();
  });

  it("rejects a too-short message", () => {
    const errors = validateContactForm({ ...validValues, message: "hi" });
    expect(errors.message).toBeTruthy();
  });

  it("rejects values over the maximum length", () => {
    const errors = validateContactForm({
      ...validValues,
      name: "a".repeat(CONTACT_LIMITS.name.max + 1),
      subject: "s".repeat(CONTACT_LIMITS.subject.max + 1),
      message: "m".repeat(CONTACT_LIMITS.message.max + 1),
    });
    expect(errors.name).toBeTruthy();
    expect(errors.subject).toBeTruthy();
    expect(errors.message).toBeTruthy();
  });

  it("trims surrounding whitespace before validating", () => {
    const errors = validateContactForm({
      ...validValues,
      name: "   ",
    });
    expect(errors.name).toBeTruthy();
  });

  it("ignores the honeypot field for validity", () => {
    // A populated honeypot is spam detection's concern (server side), not a
    // client validation error — a valid-looking submission stays valid here.
    expect(
      isContactFormValid({ ...validValues, companyWebsite: "http://spam" }),
    ).toBe(true);
  });
});
