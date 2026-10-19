import { SESSION_COOKIE, readSessionToken } from "../auth/session.js";

/** Lets the request through only with a valid admin session cookie. */
export async function requireAdmin(req, res, next) {
  const admin = await readSessionToken(req.cookies?.[SESSION_COOKIE]);
  if (!admin) {
    res.status(401).json({ success: false, error: "Sign-in required." });
    return;
  }
  req.admin = admin;
  next();
}
