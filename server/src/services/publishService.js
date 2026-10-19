import { env } from "../config/env.js";
import { getDb } from "../db/client.js";
import { COLLECTIONS, SINGLETON_ID } from "../db/collections.js";
import { contentSchema } from "../schemas/content.js";
import { getContentSnapshot } from "./contentService.js";

const HIDE_ID = { projection: { _id: 0 } };
const TIMEOUT_MS = 10_000;
// A Vercel build takes a minute or two; a second click in that window
// would only queue a duplicate build.
const COOLDOWN_MS = 60_000;
const HISTORY_SIZE = 5;

function httpError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  if (details) error.details = details;
  return error;
}

/** Records that content changed, so the admin can show "not published". */
export async function markEdited() {
  const db = await getDb();
  await db
    .collection(COLLECTIONS.siteState)
    .updateOne(
      { _id: SINGLETON_ID },
      { $set: { lastEditAt: new Date().toISOString() } },
      { upsert: true },
    );
}

/**
 * Publish state for the admin: whether a deploy hook is set, when content
 * last changed, and the latest publishes (newest first).
 */
export async function getPublishStatus() {
  const db = await getDb();
  const [state, history] = await Promise.all([
    db.collection(COLLECTIONS.siteState).findOne({ _id: SINGLETON_ID }),
    db
      .collection(COLLECTIONS.publishLog)
      .find({}, HIDE_ID)
      .sort({ at: -1 })
      .limit(HISTORY_SIZE)
      .toArray(),
  ]);
  const lastPublishAt = history.find((entry) => entry.ok)?.at ?? null;
  const lastEditAt = state?.lastEditAt ?? null;
  return {
    configured: Boolean(env.deployHookUrl),
    lastEditAt,
    lastPublishAt,
    hasUnpublishedChanges: Boolean(
      lastEditAt && (!lastPublishAt || lastEditAt > lastPublishAt),
    ),
    history,
  };
}

/**
 * Starts a production build through the Vercel Deploy Hook. The build
 * exports the database (server/scripts/export-content.js), so the content
 * is checked here first: invalid content would otherwise be skipped there
 * and the old site rebuilt without anyone noticing.
 * @param {{ login: string }} admin
 */
export async function publishSite(admin) {
  if (!env.deployHookUrl) {
    throw httpError(
      503,
      "Publishing isn't configured (no VERCEL_DEPLOY_HOOK_URL).",
    );
  }
  const db = await getDb();
  const log = db.collection(COLLECTIONS.publishLog);
  const [latest] = await log
    .find({ ok: true })
    .sort({ at: -1 })
    .limit(1)
    .toArray();
  if (latest && Date.now() - Date.parse(latest.at) < COOLDOWN_MS) {
    throw httpError(
      429,
      "A publish started less than a minute ago. Wait for it to finish.",
    );
  }

  // The schema ignores the snapshot's GitHub cache, which isn't edited.
  const check = contentSchema.safeParse(await getContentSnapshot());
  if (!check.success) {
    throw httpError(
      400,
      "Some content is invalid, so it can't be published. Fix it first.",
      check.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const entry = { at: new Date().toISOString(), by: admin.login };
  try {
    const response = await fetch(env.deployHookUrl, {
      method: "POST",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`Vercel answered ${response.status}.`);
    const body = await response.json().catch(() => ({}));
    Object.assign(entry, { ok: true, jobId: body.job?.id ?? null });
  } catch (error) {
    Object.assign(entry, { ok: false, error: error.message });
  }
  await log.insertOne({ ...entry });
  if (!entry.ok) {
    throw httpError(502, `Couldn't start the build: ${entry.error}`);
  }
  return entry;
}
