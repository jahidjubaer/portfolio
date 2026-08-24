const BENGALI_PATTERN = /[ঀ-৿]/;

/**
 * Best-effort language hint for Blogger-sourced text — Unicode script
 * detection, not real language identification. Only ever flags Bengali;
 * everything else (English, empty, or unrecognized text) is left
 * undefined so the page's own lang="en" applies by default rather than
 * mislabeling mixed or unknown content.
 * @param {string} text
 * @returns {"bn" | undefined}
 */
export function detectTextLanguage(text) {
  if (typeof text !== "string" || !text.trim()) return undefined;
  return BENGALI_PATTERN.test(text) ? "bn" : undefined;
}
