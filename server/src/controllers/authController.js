import { randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";
import {
  SESSION_COOKIE,
  createSessionToken,
  isAuthConfigured,
  sessionCookieOptions,
} from "../auth/session.js";
import {
  buildAuthorizeUrl,
  exchangeCodeForToken,
  fetchGitHubUser,
} from "../services/githubOAuth.js";

export const STATE_COOKIE = "oauth_state";

// Lax, not Strict: the callback is a top-level navigation coming back from
// github.com, and a Strict cookie would not be sent with it.
const STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/api/auth",
};

function redirectUri(req) {
  return (
    env.oauthCallbackUrl ||
    `${req.protocol}://${req.get("host")}/api/auth/github/callback`
  );
}

function adminUrl(error) {
  return error
    ? `${env.clientOrigin}/admin?error=${error}`
    : `${env.clientOrigin}/admin`;
}

function sameString(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

function notConfigured(res) {
  res.status(503).json({
    success: false,
    error: "Admin sign-in is not configured.",
  });
}

export function startGitHubLogin(req, res) {
  if (!isAuthConfigured()) return notConfigured(res);
  const state = randomBytes(32).toString("base64url");
  res.cookie(STATE_COOKIE, state, {
    ...STATE_COOKIE_OPTIONS,
    secure: env.nodeEnv === "production",
    maxAge: 10 * 60 * 1000,
  });
  res.redirect(buildAuthorizeUrl({ state, redirectUri: redirectUri(req) }));
}

export async function handleGitHubCallback(req, res) {
  if (!isAuthConfigured()) return notConfigured(res);
  const { code, state } = req.query;
  const expectedState = req.cookies?.[STATE_COOKIE];
  res.clearCookie(STATE_COOKIE, STATE_COOKIE_OPTIONS);

  if (
    typeof code !== "string" ||
    typeof state !== "string" ||
    !expectedState ||
    !sameString(state, expectedState)
  ) {
    return res.redirect(adminUrl("state"));
  }

  let user;
  try {
    const accessToken = await exchangeCodeForToken({
      code,
      redirectUri: redirectUri(req),
    });
    user = await fetchGitHubUser(accessToken);
  } catch {
    return res.redirect(adminUrl("github"));
  }

  if (user.id !== env.adminGithubId) {
    return res.redirect(adminUrl("not-allowed"));
  }

  res.cookie(
    SESSION_COOKIE,
    await createSessionToken(user),
    sessionCookieOptions(),
  );
  res.redirect(adminUrl());
}

export function getCurrentAdmin(req, res) {
  res.json({ success: true, user: req.admin });
}

export function logout(_req, res) {
  // Express 5's clearCookie ignores maxAge and always expires the cookie.
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
  res.json({ success: true });
}
