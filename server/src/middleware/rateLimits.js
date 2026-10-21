import { rateLimit } from "express-rate-limit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function limiter(limit) {
  return rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      error: "Too many requests. Please try again later.",
    },
  });
}

/** Sign-in endpoints: generous for one person, tight for a script. */
export const authRateLimit = limiter(60);

/** Admin API: room for a busy editing session. */
export const adminRateLimit = limiter(600);

/** Contact form: a few messages per visitor, not a mailbox flood. */
export const contactRateLimit = limiter(5);

/** AI drafts cost money per call; a session needs a handful. */
export const aiRateLimit = limiter(30);

/** "Ask about Jahid": a short conversation's worth per visitor. */
export const askRateLimit = limiter(10);
