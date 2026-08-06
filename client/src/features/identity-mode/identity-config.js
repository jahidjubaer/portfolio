export const IDENTITIES = {
  SYSTEM: "system",
  STORY: "story",
};

/**
 * Route prefixes that use the STORY identity. Every other route uses
 * SYSTEM (the default).
 */
const STORY_ROUTE_PREFIXES = ["/beyond"];

/**
 * @param {string} pathname
 * @returns {"system" | "story"}
 */
export function resolveIdentityForPath(pathname) {
  const isStory = STORY_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return isStory ? IDENTITIES.STORY : IDENTITIES.SYSTEM;
}
