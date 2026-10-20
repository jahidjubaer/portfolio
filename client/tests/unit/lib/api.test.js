import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { submitContactMessage } from "../../../src/lib/api";

const VALID_PAYLOAD = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Project inquiry",
  message: "Hello, I'd like to discuss a potential project with you.",
  companyWebsite: "",
};

const WEB3FORMS = "https://api.web3forms.com/submit";

/**
 * Stubs fetch with separate answers for the inbox (/api/contact) and
 * Web3Forms. An Error answer rejects (network failure).
 */
function stubFetch({ inbox, web3forms }) {
  const answer = (value) =>
    value instanceof Error ? Promise.reject(value) : Promise.resolve(value());
  return vi
    .spyOn(globalThis, "fetch")
    .mockImplementation((url) =>
      url === WEB3FORMS ? answer(web3forms) : answer(inbox),
    );
}

const ok =
  (body = { success: true }, status = 200) =>
  () =>
    new Response(JSON.stringify(body), { status });

describe("submitContactMessage", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_WEB3FORMS_ACCESS_KEY", "test-access-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("stores the message in the inbox and emails it through Web3Forms", async () => {
    const fetchSpy = stubFetch({ inbox: ok({}, 201), web3forms: ok() });

    const result = await submitContactMessage(VALID_PAYLOAD);

    const inboxCall = fetchSpy.mock.calls.find(([url]) =>
      url.endsWith("/api/contact"),
    );
    expect(JSON.parse(inboxCall[1].body)).toEqual({
      name: VALID_PAYLOAD.name,
      email: VALID_PAYLOAD.email,
      subject: VALID_PAYLOAD.subject,
      message: VALID_PAYLOAD.message,
    });
    const web3Call = fetchSpy.mock.calls.find(([url]) => url === WEB3FORMS);
    const body = JSON.parse(web3Call[1].body);
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

  it("counts as received when only the inbox got it", async () => {
    stubFetch({ inbox: ok({}, 201), web3forms: ok({ success: false }) });
    const result = await submitContactMessage(VALID_PAYLOAD);
    expect(result.success).toBe(true);
  });

  it("counts as received when only the email went out", async () => {
    stubFetch({ inbox: ok({}, 503), web3forms: ok() });
    const result = await submitContactMessage(VALID_PAYLOAD);
    expect(result.success).toBe(true);
  });

  it("renders a controlled failure when both reject the submission", async () => {
    stubFetch({ inbox: ok({}, 500), web3forms: ok({ success: false }) });

    const result = await submitContactMessage(VALID_PAYLOAD);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/something went wrong/i);
  });

  it("renders a controlled failure on a 429 rate-limit response", async () => {
    stubFetch({
      inbox: ok({}, 429),
      web3forms: ok({ success: false }, 429),
    });

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

  it("skips Web3Forms when the access key is missing, but still stores the message", async () => {
    vi.stubEnv("VITE_WEB3FORMS_ACCESS_KEY", "");
    const fetchSpy = stubFetch({ inbox: ok({}, 201), web3forms: ok() });

    const result = await submitContactMessage(VALID_PAYLOAD);

    expect(fetchSpy.mock.calls.some(([url]) => url === WEB3FORMS)).toBe(false);
    expect(result.success).toBe(true);
  });

  it("explains the form is unavailable when the key is missing and the inbox is down", async () => {
    vi.stubEnv("VITE_WEB3FORMS_ACCESS_KEY", "");
    stubFetch({ inbox: new TypeError("offline"), web3forms: ok() });

    const result = await submitContactMessage(VALID_PAYLOAD);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/temporarily unavailable/i);
  });

  it("reports success without sending anything when the honeypot field is filled", async () => {
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
