import { SignJWT, jwtVerify } from "jose";
import { env } from "../config/env.js";

export const SESSION_COOKIE = "admin_session";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

const ISSUER = "jahid-portfolio";
const AUDIENCE = "admin";
const MIN_SECRET_LENGTH = 32;

export function isAuthConfigured() {
  return Boolean(
    env.githubClientId &&
    env.githubClientSecret &&
    env.sessionSecret.length >= MIN_SECRET_LENGTH,
  );
}

function signingKey() {
  return new TextEncoder().encode(env.sessionSecret);
}

/**
 * @param {{ id: number, login: string, avatarUrl: string }} user
 * @returns {Promise<string>}
 */
export function createSessionToken(user) {
  return new SignJWT({ login: user.login, avatarUrl: user.avatarUrl })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(signingKey());
}

/**
 * Verifies signature, expiry, issuer and audience, then re-checks the
 * allow-list so changing ADMIN_GITHUB_ID revokes existing sessions.
 * @param {string | undefined} token
 * @returns {Promise<{ id: number, login: string, avatarUrl: string } | null>}
 */
export async function readSessionToken(token) {
  if (!token || !isAuthConfigured()) return null;
  try {
    const { payload } = await jwtVerify(token, signingKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
    if (payload.sub !== String(env.adminGithubId)) return null;
    return {
      id: Number(payload.sub),
      login: String(payload.login),
      avatarUrl: String(payload.avatarUrl),
    };
  } catch {
    return null;
  }
}

/** @param {number} [maxAgeMs] */
export function sessionCookieOptions(maxAgeMs = SESSION_TTL_SECONDS * 1000) {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeMs,
  };
}
