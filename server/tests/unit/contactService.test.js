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
});
