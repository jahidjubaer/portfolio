import { describe, it, expect } from "vitest";
import { validateContactPayload } from "../../src/utils/contactValidation.js";

const VALID_PAYLOAD = {
  name: "Jane Doe",
  email: "Jane.Doe@Example.com",
  subject: "Project inquiry",
  message: "Hello, I'd like to discuss a potential project with you.",
};

describe("validateContactPayload", () => {
  it("accepts a valid payload and normalizes the email to lowercase", () => {
    const result = validateContactPayload(VALID_PAYLOAD);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.value).toEqual({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      subject: "Project inquiry",
      message: VALID_PAYLOAD.message,
    });
    expect(result.isSpam).toBe(false);
  });

  it("trims whitespace from every field", () => {
    const result = validateContactPayload({
      ...VALID_PAYLOAD,
      name: "  Jane Doe  ",
      subject: "  Project inquiry  ",
    });

    expect(result.value.name).toBe("Jane Doe");
    expect(result.value.subject).toBe("Project inquiry");
  });

  it("rejects missing fields with field-level errors", () => {
    const result = validateContactPayload({});

    expect(result.valid).toBe(false);
    expect(result.errors).toMatchObject({
      name: expect.any(String),
      email: expect.any(String),
      subject: expect.any(String),
      message: expect.any(String),
    });
    expect(result.value).toBeNull();
  });

  it("rejects an invalid email format", () => {
    const result = validateContactPayload({
      ...VALID_PAYLOAD,
      email: "not-an-email",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it("rejects an oversized message", () => {
    const result = validateContactPayload({
      ...VALID_PAYLOAD,
      message: "a".repeat(2001),
    });

    expect(result.valid).toBe(false);
    expect(result.errors.message).toBeDefined();
  });

  it("rejects a message that is too short", () => {
    const result = validateContactPayload({ ...VALID_PAYLOAD, message: "hi" });

    expect(result.valid).toBe(false);
    expect(result.errors.message).toBeDefined();
  });

  it("does not silently coerce a non-string field into a string", () => {
    const result = validateContactPayload({
      ...VALID_PAYLOAD,
      name: { toString: () => "Jane Doe" },
    });

    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it("flags a populated honeypot as spam without a field error", () => {
    const result = validateContactPayload({
      ...VALID_PAYLOAD,
      companyWebsite: "https://spam.example",
    });

    expect(result.valid).toBe(true);
    expect(result.isSpam).toBe(true);
    expect(result.errors.companyWebsite).toBeUndefined();
  });

  it("treats an empty honeypot as not spam", () => {
    const result = validateContactPayload({
      ...VALID_PAYLOAD,
      companyWebsite: "",
    });

    expect(result.isSpam).toBe(false);
  });
});
