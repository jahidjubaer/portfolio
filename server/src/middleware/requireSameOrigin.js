import { env } from "../config/env.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF guard for cookie-authenticated writes: a state-changing request
 * must carry an Origin header naming the site itself. SameSite=Strict on
 * the session cookie already blocks most cross-site requests; this covers
 * older browsers and same-site subdomains.
 */
export function requireSameOrigin(req, res, next) {
  if (SAFE_METHODS.has(req.method) || req.get("origin") === env.clientOrigin) {
    next();
    return;
  }
  res
    .status(403)
    .json({ success: false, error: "Cross-site request blocked." });
}
