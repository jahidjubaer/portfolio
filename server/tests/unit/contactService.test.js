import { describe, it, expect, afterEach, vi } from "vitest";
import { env } from "../../src/config/env.js";
import { deliverContactMessage } from "../../src/services/contactService.js";

const MESSAGE = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Hello",
  message: "A test message.",
};

const original = { ...env };

afterEach(() => {
  Object.assign(env, original);
  vi.restoreAllMocks();
});

describe("deliverContactMessage", () => {
  it("simulates delivery in development without sending a real email", async () => {
    env.nodeEnv = "development";
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await deliverContactMessage(MESSAGE);

    expect(result).toEqual({ delivered: true, simulated: true });
    expect(logSpy).toHaveBeenCalledTimes(1);
    const loggedLine = logSpy.mock.calls[0][0];
    expect(loggedLine).not.toContain(MESSAGE.message);
    expect(loggedLine).not.toContain("jane@example.com");
  });

  it("simulates delivery in test without sending a real email", async () => {
    env.nodeEnv = "test";
    vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await deliverContactMessage(MESSAGE);

    expect(result.delivered).toBe(true);
    expect(result.simulated).toBe(true);
  });

  it("refuses to claim success in production with no provider configured", async () => {
    env.nodeEnv = "production";
    env.contactProvider = "";
    env.contactRecipientEmail = "";
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await deliverContactMessage(MESSAGE);

    expect(result).toEqual({
      delivered: false,
      simulated: false,
      reason: "provider-unavailable",
    });
    expect(errorSpy).toHaveBeenCalled();
  });

  it("refuses to claim success when web3forms is selected but its access key is missing", async () => {
    env.nodeEnv = "production";
    env.contactProvider = "web3forms";
    env.contactRecipientEmail = "recipient@example.com";
    env.web3formsAccessKey = "";
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await deliverContactMessage(MESSAGE);

    expect(result).toEqual({
      delivered: false,
      simulated: false,
      reason: "provider-unavailable",
    });
    // An incomplete configuration must never even attempt the request.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("delivers via web3forms when fully configured, without logging the access key or message", async () => {
    env.nodeEnv = "production";
    env.contactProvider = "web3forms";
    env.contactRecipientEmail = "recipient@example.com";
    env.web3formsAccessKey = "test-access-key";
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await deliverContactMessage(MESSAGE);

    expect(result).toEqual({ delivered: true, simulated: false });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.web3forms.com/submit",
      expect.objectContaining({ method: "POST" }),
    );
    const [, requestInit] = fetchSpy.mock.calls[0];
    const sentPayload = JSON.parse(requestInit.body);
    // The access key belongs in the outbound request to the provider — the
    // leak concern is application logs, not the authenticated request itself.
    expect(sentPayload.access_key).toBe("test-access-key");
    expect(sentPayload.email).toBe(MESSAGE.email);
    // Web3Forms ties the recipient to the access key itself — there is no
    // per-request override, so one must never be sent.
    expect(sentPayload).not.toHaveProperty("to");
    // Truthfully identifies our own origin, for access keys with Domain
    // Restriction enabled — server-to-server fetch sets neither by default.
    expect(requestInit.headers.Referer).toBe(env.clientOrigin);
    expect(requestInit.headers.Origin).toBe(env.clientOrigin);
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("reports a controlled failure when web3forms rejects the submission", async () => {
    env.nodeEnv = "production";
    env.contactProvider = "web3forms";
    env.contactRecipientEmail = "recipient@example.com";
    env.web3formsAccessKey = "test-access-key";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 200 }),
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await deliverContactMessage(MESSAGE);

    expect(result).toEqual({
      delivered: false,
      simulated: false,
      reason: "provider-error",
    });
    expect(errorSpy).toHaveBeenCalled();
    // The failure log must never include the access key.
    expect(errorSpy.mock.calls[0][0]).not.toContain("test-access-key");
  });
});
