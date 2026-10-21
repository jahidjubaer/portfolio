import { put } from "@vercel/blob/client";
import { AdminApiError, requestUploadToken } from "./admin-api";

const IMAGE_INPUT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_EDGE = 2400;
const MAX_PDF_BYTES = 5 * 1024 * 1024;

export const IMAGE_ACCEPT = IMAGE_INPUT_TYPES.join(",");

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Downscales a photo to at most `maxEdge` (2400) px on its long edge and re-encodes it
 * as WebP (JPEG where the browser can't encode WebP). Camera files are
 * often 5–20 MB; this keeps uploads quick and pages light, and gives the
 * exact pixel size the public site needs to reserve space.
 * @param {File} file
 * @returns {Promise<{ blob: Blob, width: number, height: number }>}
 */
export async function prepareImage(file, maxEdge = MAX_EDGE) {
  if (!IMAGE_INPUT_TYPES.includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, WebP, or AVIF image.");
  }
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("That image couldn't be read. Try another file.");
  }
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob = await canvasToBlob(canvas, "image/webp", 0.85);
  if (!blob || blob.type !== "image/webp") {
    blob = await canvasToBlob(canvas, "image/jpeg", 0.88);
  }
  if (!blob) throw new Error("That image couldn't be processed.");
  return { blob, width, height };
}

async function uploadBlob(kind, filename, body, contentType) {
  const { token, pathname } = await requestUploadToken(
    kind,
    filename,
    contentType,
  );
  try {
    const result = await put(pathname, body, {
      access: "public",
      token,
      contentType,
    });
    return result.url;
  } catch (error) {
    throw new AdminApiError(`Upload failed: ${error.message}`, 0);
  }
}

/**
 * @param {"photo" | "image"} kind
 * @param {File} file
 * @param {{ smallWidth?: number }} [options] also upload a copy this wide,
 *   for cards and `srcset` (skipped when the image is already that narrow)
 * @returns {Promise<{ url: string, width: number, height: number, small?: { url: string, width: number, height: number } }>}
 */
export async function uploadImage(kind, file, { smallWidth } = {}) {
  const { blob, width, height } = await prepareImage(file);
  const url = await uploadBlob(kind, file.name, blob, blob.type);
  if (!smallWidth || width <= smallWidth) return { url, width, height };
  const smallEdge = Math.round((smallWidth * Math.max(width, height)) / width);
  const small = await prepareImage(file, smallEdge);
  const smallUrl = await uploadBlob(
    kind,
    file.name.replace(/(\.[^.]+)?$/, `-${smallWidth}w$1`),
    small.blob,
    small.blob.type,
  );
  return {
    url,
    width,
    height,
    small: { url: smallUrl, width: small.width, height: small.height },
  };
}

/** @param {File} file @returns {Promise<string>} the PDF's public URL */
export async function uploadPdf(file) {
  if (file.type !== "application/pdf") throw new Error("Choose a PDF file.");
  if (file.size > MAX_PDF_BYTES) {
    throw new Error("The PDF must be 5 MB or smaller.");
  }
  return uploadBlob("resume", file.name, file, file.type);
}
