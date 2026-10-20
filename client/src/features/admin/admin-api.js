import { API_BASE_URL } from "../../lib/api";

/** Full-page navigation target that starts the GitHub sign-in. */
export const ADMIN_LOGIN_URL = `${API_BASE_URL}/api/auth/github`;

/**
 * Messages for the `?error=` codes the OAuth callback redirects back with
 * (see server/src/controllers/authController.js).
 */
export const SIGN_IN_ERRORS = {
  "not-allowed": "That GitHub account isn't allowed to manage this site.",
  state: "The sign-in link expired or was tampered with. Please try again.",
  github: "GitHub couldn't complete the sign-in. Please try again.",
};

/** An API failure with the server's message and per-field issues. */
export class AdminApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   * @param {Array<{ path: string, message: string }>} [issues]
   */
  constructor(message, status, issues = []) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

async function adminRequest(method, path, body) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AdminApiError(
      "Can't reach the server. Check your connection.",
      0,
    );
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      response.status === 401
        ? "Your session expired. Sign in again."
        : (payload.error ?? `Request failed (${response.status}).`);
    throw new AdminApiError(message, response.status, payload.issues);
  }
  return payload;
}

/**
 * @returns {Promise<{ id: number, login: string, avatarUrl: string } | null>}
 *   the signed-in admin, or null when signed out
 */
export async function getAdminSession() {
  try {
    const body = await adminRequest("GET", "/auth/me");
    return body.user;
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}

export async function signOutAdmin() {
  await adminRequest("POST", "/auth/logout");
}

export async function fetchAdminContent() {
  return (await adminRequest("GET", "/admin/content")).data;
}

/** @param {"profile" | "beyond"} name */
export function saveSingleton(name, value) {
  return adminRequest("PUT", `/admin/singletons/${name}`, value);
}

export function createListItem(name, value) {
  return adminRequest("POST", `/admin/lists/${name}`, value);
}

export function updateListItem(name, key, value) {
  return adminRequest(
    "PUT",
    `/admin/lists/${name}/${encodeURIComponent(key)}`,
    value,
  );
}

export function deleteListItem(name, key) {
  return adminRequest(
    "DELETE",
    `/admin/lists/${name}/${encodeURIComponent(key)}`,
  );
}

/** @param {string[]} keys every item's key, in the new display order */
export function reorderList(name, keys) {
  return adminRequest("PUT", `/admin/lists/${name}/order`, { keys });
}

/**
 * Asks the server for a one-time upload token. The server picks the path
 * and enforces the file type and size for this kind of upload.
 * @param {"photo" | "image" | "resume"} kind
 * @param {string} filename
 * @param {string} contentType
 * @returns {Promise<{ token: string, pathname: string }>}
 */
export async function requestUploadToken(kind, filename, contentType) {
  const body = await adminRequest("POST", "/admin/uploads", {
    kind,
    filename,
    contentType,
  });
  return body.data;
}

/**
 * Refreshes the GitHub repo cache now (the daily cron does it otherwise).
 * @returns {Promise<{ repoCount: number }>}
 */
export async function syncGitHub() {
  return (await adminRequest("POST", "/admin/github/sync")).data;
}

/**
 * Starts a rebuild of the public site from the database (Vercel Deploy
 * Hook). The site shows the changes when the build finishes.
 * @returns {Promise<{ at: string, by: string, ok: boolean, jobId: string | null }>}
 */
export async function publishSite() {
  return (await adminRequest("POST", "/admin/publish")).data;
}

/**
 * Asks Gemini to draft fields from public repos. Nothing is saved.
 * A project can be drafted from several repos at once (client + server);
 * a learning track from one.
 * @param {"project" | "learning"} kind
 * @param {string[]} repos repo names of the synced account
 */
export async function draftFromRepo(kind, repos) {
  const body = kind === "project" ? { repos } : { repo: repos[0] };
  return (await adminRequest("POST", `/admin/ai/${kind}-draft`, body)).data;
}

/** Refreshes the Codeforces / VJudge / practice-repo stats now. */
export async function syncCodingStats() {
  return (await adminRequest("POST", "/admin/coding/sync")).data;
}

/** @param {string} id @param {{ read?: boolean, archived?: boolean }} changes */
export async function updateMessage(id, changes) {
  return (
    await adminRequest(
      "PATCH",
      `/admin/messages/${encodeURIComponent(id)}`,
      changes,
    )
  ).data;
}

export function deleteMessage(id) {
  return adminRequest("DELETE", `/admin/messages/${encodeURIComponent(id)}`);
}
