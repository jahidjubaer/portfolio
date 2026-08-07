/**
 * Minimal in-memory per-IP rate limiter for POST /api/contact only.
 * No third-party package. Not suitable for a multi-process deployment
 * (state is per Node process) — acceptable for this app's current
 * single-instance hosting; revisit if that changes.
 */

export const CONTACT_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
};

/**
 * Creates an isolated limiter instance (its own Map) so tests never share
 * state with each other or with the app-level singleton.
 */
export function createContactRateLimiter({
  maxAttempts = CONTACT_RATE_LIMIT.maxAttempts,
  windowMs = CONTACT_RATE_LIMIT.windowMs,
} = {}) {
  /** @type {Map<string, number[]>} */
  const attemptsByIp = new Map();

  function prune(now) {
    for (const [ip, timestamps] of attemptsByIp) {
      const recent = timestamps.filter((time) => now - time < windowMs);
      if (recent.length === 0) {
        attemptsByIp.delete(ip);
      } else {
        attemptsByIp.set(ip, recent);
      }
    }
  }

  function middleware(req, res, next) {
    const now = Date.now();
    // req.ip reflects Express's own connection-level address; this app has
    // no reverse proxy configured (`trust proxy` is unset), so trusting
    // client-supplied headers like X-Forwarded-For here would let a client
    // spoof its own rate-limit identity.
    const ip = req.ip || "unknown";

    prune(now);

    const timestamps = attemptsByIp.get(ip) ?? [];
    if (timestamps.length >= maxAttempts) {
      res.status(429).json({
        success: false,
        message: "Too many messages sent. Please try again later.",
      });
      return;
    }

    timestamps.push(now);
    attemptsByIp.set(ip, timestamps);
    next();
  }

  function reset() {
    attemptsByIp.clear();
  }

  return { middleware, reset, attemptsByIp };
}

const defaultLimiter = createContactRateLimiter();

export const contactRateLimit = defaultLimiter.middleware;
export const resetContactRateLimit = defaultLimiter.reset;
