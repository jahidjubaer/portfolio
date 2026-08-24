import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { submitContactMessage } from "../../../src/lib/api";

const VALID_PAYLOAD = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Project inquiry",
  message: "Hello, I'd like to discuss a potential project with you.",
  companyWebsite: "",
};

describe("submitContactMessage", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_WEB3FORMS_ACCESS_KEY", "test-access-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("submits directly to the Web3Forms API with the access key and message fields", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );

    const result = await submitContactMessage(VALID_PAYLOAD);

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.web3forms.com/submit",
      expect.objectContaining({ method: "POST" }),
    );
    const [, requestInit] = fetchSpy.mock.calls[0];
    const body = JSON.parse(requestInit.body);
    expect(body).toMatchObject({
      access_key: "test-access-key",
      name: VALID_PAYLOAD.name,
      email: VALID_PAYLOAD.email,
      subject: VALID_PAYLOAD.subject,
      message: VALID_PAYLOAD.message,
      botcheck: "",
    });
    expect(body).not.toHaveProperty("to");
    expect(body).not.toHaveProperty("companyWebsite");
    expect(result).toEqual({
      success: true,
      message: "Your message has been received.",
    });
  });

  it("renders a controlled failure when Web3Forms rejects the submission", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 200 }),
    );

    const result = await submitContactMessage(VALID_PAYLOAD);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/something went wrong/i);
  });

  it("renders a controlled failure on a 429 rate-limit response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 429 }),
    );

    const result = await submitContactMessage(VALID_PAYLOAD);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/too many messages/i);
  });

  it("fails safely on a network error without throwing", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));

    const result = await submitContactMessage(VALID_PAYLOAD);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/could not reach the server/i);
  });

  it("fails safely without contacting Web3Forms when the access key is missing", async () => {
    vi.stubEnv("VITE_WEB3FORMS_ACCESS_KEY", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await submitContactMessage(VALID_PAYLOAD);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/temporarily unavailable/i);
  });

  it("reports success without contacting Web3Forms when the honeypot field is filled", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await submitContactMessage({
      ...VALID_PAYLOAD,
      companyWebsite: "https://spam.example",
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      message: "Your message has been received.",
    });
  });
});
