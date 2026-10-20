/**
 * A project's GitHub repos are kept as ordinary `repository` links, so the
 * public site and the stale-link warnings read them unchanged. These
 * helpers translate between those links and the admin's repo picker.
 */

export const REPO_ROLES = [
  { value: "client", label: "Client", linkLabel: "Client repository" },
  { value: "server", label: "Server", linkLabel: "Server repository" },
  { value: "docs", label: "Docs", linkLabel: "Docs repository" },
  { value: "other", label: "Other", linkLabel: "Repository" },
];

/** "Server repository" → "server"; anything unrecognised is "other". */
export function roleFromLabel(label = "") {
  if (/client|front/i.test(label)) return "client";
  if (/server|api|back/i.test(label)) return "server";
  if (/doc/i.test(label)) return "docs";
  return "other";
}

/** "sarabo-client" → "client": a first guess, changed in the picker. */
export function guessRole(repoName) {
  const role = roleFromLabel(repoName);
  return role === "docs" && !/(^|[-_.])docs?($|[-_.])/i.test(repoName)
    ? "other"
    : role;
}

export function linkLabelFor(role) {
  return (REPO_ROLES.find((entry) => entry.value === role) ?? REPO_ROLES.at(-1))
    .linkLabel;
}

/**
 * The repo name when a URL points at a repo of the synced account.
 * @param {string | null | undefined} url
 * @param {string} username
 */
export function repoNameFromUrl(url, username) {
  const prefix = `https://github.com/${username}/`.toLowerCase();
  if (!url || !url.toLowerCase().startsWith(prefix)) return null;
  return url.slice(prefix.length).split(/[/?#]/)[0] || null;
}

/**
 * Repos of the synced account a project links to, in link order.
 * @param {Array<{ url?: string | null, type?: string }>} links
 * @param {string} username
 */
export function linkedRepoNames(links = [], username) {
  return links
    .filter((link) => link.type === "repository")
    .map((link) => repoNameFromUrl(link.url, username))
    .filter(Boolean);
}

/**
 * Links with one more repository link. Repos already linked are left as
 * they are.
 * @param {Array<Record<string, any>>} links
 * @param {{ name: string, url: string }} repo
 * @param {string} username
 * @param {string} [role]
 */
export function addRepoLink(links = [], repo, username, role) {
  if (linkedRepoNames(links, username).includes(repo.name)) return links;
  return [
    ...links,
    {
      label: linkLabelFor(role ?? guessRole(repo.name)),
      url: repo.url,
      type: "repository",
    },
  ];
}
