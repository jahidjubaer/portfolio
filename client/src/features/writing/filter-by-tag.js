/**
 * The tags worth filtering by, and the posts the selected one leaves.
 * A single tag (or none) would be a control that does nothing useful.
 * @param {import("../../data/posts").Post[]} posts
 * @param {string} selected
 */
export function filterByTag(posts, selected) {
  const tags = [...new Set(posts.flatMap((post) => post.tags))];
  const showFilters = tags.length >= 2;
  const filtered =
    showFilters && selected !== "All"
      ? posts.filter((post) => post.tags.includes(selected))
      : posts;
  return { tags: showFilters ? tags : [], filtered };
}
