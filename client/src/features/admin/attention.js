/**
 * The overview's "Needs attention" checklist, worked out from the admin
 * content. Each item links straight to where it's fixed. `fix` items make
 * the site look unfinished or wrong; `suggestion` items would make it
 * better but are fine to leave.
 *
 * @typedef {{
 *   id: string,
 *   tone: "fix" | "suggestion",
 *   message: string,
 *   to: string,
 * }} AttentionItem
 */

/**
 * The number shown next to a section in the sidebar: list length, public
 * repo count, or null for single-document sections.
 */
export function sectionCount(path, content) {
  if (path === "repositories") {
    return content.repositories?.repos.filter((repo) => !repo.fork).length ?? 0;
  }
  if (Array.isArray(content[path])) return content[path].length;
  return null;
}

/** True while the database still holds the pre-P2 shapes. */
export function needsMigration(content) {
  return (content.experience ?? []).some(
    (entry) => !Array.isArray(entry.roles),
  );
}

function plural(count, one, many) {
  return count === 1 ? one : many;
}

/** "Employability Skills – JobReady" and "(JobReady)" compare equal. */
function looseTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function usageCounts(content) {
  const counts = new Map();
  const count = (id) => id && counts.set(id, (counts.get(id) ?? 0) + 1);
  for (const list of ["experience", "education", "certifications"]) {
    for (const item of content[list] ?? []) count(item.organizationId);
  }
  for (const track of content.learningTracks ?? []) {
    for (const resource of track.resources ?? [])
      count(resource.organizationId);
  }
  return counts;
}

/** How many items point at each organization, for the list's subtitles. */
export function organizationUsage(content, id) {
  return usageCounts(content).get(id) ?? 0;
}

/**
 * @param {Record<string, any>} content
 * @returns {AttentionItem[]}
 */
export function getAttentionItems(content) {
  if (needsMigration(content)) return [];
  const items = [];
  const organizations = content.organizations ?? [];
  const certifications = content.certifications ?? [];

  const withoutLogo = organizations.filter((item) => !item.logo);
  if (withoutLogo.length) {
    items.push({
      id: "logos",
      tone: "fix",
      message: `${withoutLogo.length} ${plural(withoutLogo.length, "organization has", "organizations have")} no logo yet (initials are shown instead): ${withoutLogo.map((item) => item.name).join(", ")}.`,
      to:
        withoutLogo.length === 1
          ? `/admin/organizations/${withoutLogo[0].id}`
          : "/admin/organizations",
    });
  }

  const seen = new Map();
  for (const item of certifications) {
    const key = `${item.organizationId}:${looseTitle(item.title)}`;
    if (seen.has(key)) {
      items.push({
        id: `duplicate-${item.id}`,
        tone: "fix",
        message: `“${item.title}” looks like a duplicate of “${seen.get(key).title}”. Keep one.`,
        to: "/admin/certifications",
      });
    } else {
      seen.set(key, item);
    }
  }

  const usage = usageCounts(content);
  const unused = organizations.filter((item) => !usage.has(item.id));
  if (unused.length) {
    items.push({
      id: "unused-organizations",
      tone: "suggestion",
      message: `${unused.length} ${plural(unused.length, "organization isn't", "organizations aren't")} used anywhere: ${unused.map((item) => item.name).join(", ")}.`,
      to: "/admin/organizations",
    });
  }

  const withoutLink = organizations.filter((item) => !item.url);
  if (withoutLink.length) {
    items.push({
      id: "organization-links",
      tone: "suggestion",
      message: `Add a website or page link to ${withoutLink.length} ${plural(withoutLink.length, "organization", "organizations")}, so visitors can look them up.`,
      to: "/admin/organizations",
    });
  }

  const unverified = certifications.filter(
    (item) => item.status === "completed" && !item.credentialUrl,
  );
  if (unverified.length) {
    items.push({
      id: "credential-links",
      tone: "suggestion",
      message: `${unverified.length} completed ${plural(unverified.length, "certificate has", "certificates have")} no credential link, so no Show credential button.`,
      to: "/admin/certifications",
    });
  }

  const yearOnly = (content.experience ?? []).filter((entry) =>
    entry.roles.some((role) => !role.start.includes("-")),
  );
  if (yearOnly.length) {
    items.push({
      id: "role-months",
      tone: "suggestion",
      message: `Roles at ${yearOnly.length} ${plural(yearOnly.length, "organization", "organizations")} only have years. Adding months (2024-06) gives LinkedIn-style durations like "1 yr 4 mos".`,
      to: "/admin/experience",
    });
  }

  if ((content.learningTracks ?? []).length === 0) {
    items.push({
      id: "learning-tracks",
      tone: "suggestion",
      message:
        "The Learning page has no tracks yet. Add what you're learning now, with the course and what you built.",
      to: "/admin/learningTracks/new",
    });
  }

  const drafts = (content.posts ?? []).filter(
    (post) => post.status === "draft",
  );
  if (drafts.length) {
    items.push({
      id: "drafts",
      tone: "suggestion",
      message: `${drafts.length} draft ${plural(drafts.length, "post is", "posts are")} waiting to be published.`,
      to: "/admin/posts",
    });
  }

  const warnings = content.repositories?.warnings ?? [];
  if (warnings.length) {
    items.push({
      id: "github",
      tone: "fix",
      message: `${warnings.length} project ${plural(warnings.length, "link points", "links point")} at a repository that is no longer public.`,
      to: "/admin/repositories",
    });
  }

  return items;
}
