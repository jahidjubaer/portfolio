import { del } from "@vercel/blob";
import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { env } from "../config/env.js";

const IMAGE_TYPES = ["image/webp", "image/jpeg", "image/png", "image/avif"];
const MB = 1024 * 1024;

/**
 * What the admin may upload. The browser sends the file straight to Vercel
 * Blob with a short-lived token from here (function bodies are capped at
 * 4.5 MB), so the folder, file types, and size limit are fixed server-side
 * and baked into the token.
 */
export const UPLOAD_KINDS = {
  photo: { folder: "photos", types: IMAGE_TYPES, maxBytes: 8 * MB },
  image: { folder: "images", types: IMAGE_TYPES, maxBytes: 8 * MB },
  resume: { folder: "resume", types: ["application/pdf"], maxBytes: 5 * MB },
};

const EXTENSIONS = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/avif": "avif",
  "application/pdf": "pdf",
};

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

/** "My Photo (1).JPG" → "my-photo-1" */
function toBaseName(filename) {
  const base = String(filename ?? "")
    .replace(/\.[^.]*$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "file";
}

/**
 * A client token allowing exactly one upload to a server-chosen path.
 * Blob adds a random suffix, so names never collide or overwrite.
 * @param {{ kind?: unknown, filename?: unknown, contentType?: unknown }} input
 * @returns {Promise<{ token: string, pathname: string }>}
 */
export async function createUploadToken({ kind, filename, contentType }) {
  if (!env.blobToken) {
    throw httpError(503, "Uploads aren't configured (no Blob store).");
  }
  const rules = Object.hasOwn(UPLOAD_KINDS, kind) ? UPLOAD_KINDS[kind] : null;
  if (!rules) throw httpError(400, "Unknown upload kind.");
  if (!rules.types.includes(contentType)) {
    throw httpError(400, "That file type isn't allowed here.");
  }

  const pathname = `${rules.folder}/${toBaseName(filename)}.${EXTENSIONS[contentType]}`;
  const token = await generateClientTokenFromReadWriteToken({
    token: env.blobToken,
    pathname,
    allowedContentTypes: [contentType],
    maximumSizeInBytes: rules.maxBytes,
    addRandomSuffix: true,
    validUntil: Date.now() + 5 * 60 * 1000,
  });
  return { token, pathname };
}

/**
 * Removes an uploaded file. Best effort: a failure leaves an orphaned blob,
 * which must never block deleting the content that pointed at it.
 * @param {string | undefined} url
 */
export async function deleteUpload(url) {
  if (!env.blobToken || !url) return;
  try {
    if (!new URL(url).hostname.endsWith(".blob.vercel-storage.com")) return;
    await del(url, { token: env.blobToken });
  } catch (error) {
    console.warn("Couldn't delete upload", url, error.message);
  }
}
