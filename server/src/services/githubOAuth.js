import { env } from "../config/env.js";

const AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const TOKEN_URL = "https://github.com/login/oauth/access_token";
const USER_URL = "https://api.github.com/user";
const TIMEOUT_MS = 8000;

/**
 * No scopes are requested: identifying the user needs only their public
 * profile, so the token can't read or change anything else.
 * @param {{ state: string, redirectUri: string }} params
 */
export function buildAuthorizeUrl({ state, redirectUri }) {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", env.githubClientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("allow_signup", "false");
  return url.toString();
}

/**
 * @param {{ code: string, redirectUri: string }} params
 * @returns {Promise<string>} access token
 */
export async function exchangeCodeForToken({ code, redirectUri }) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.githubClientId,
      client_secret: env.githubClientSecret,
      code,
      redirect_uri: redirectUri,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    throw new Error(
      `GitHub token exchange failed: ${body.error ?? response.status}`,
    );
  }
  return body.access_token;
}

/**
 * @param {string} accessToken
 * @returns {Promise<{ id: number, login: string, avatarUrl: string }>}
 */
export async function fetchGitHubUser(accessToken) {
  const response = await fetch(USER_URL, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "jahid-portfolio-admin",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`GitHub user lookup failed: ${response.status}`);
  }
  const user = await response.json();
  return { id: user.id, login: user.login, avatarUrl: user.avatar_url };
}
