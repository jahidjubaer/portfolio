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
