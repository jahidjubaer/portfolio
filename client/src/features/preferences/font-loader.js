/**
 * Loads a non-default font family on demand. Vite splits each import into
 * its own CSS chunk, so visitors who keep Geist never download the others.
 * @param {string} fontId
 * @returns {Promise<unknown>}
 */
export function loadFont(fontId) {
  if (fontId === "inter") return import("@fontsource-variable/inter");
  if (fontId === "grotesk") return import("@fontsource-variable/space-grotesk");
  return Promise.resolve();
}
