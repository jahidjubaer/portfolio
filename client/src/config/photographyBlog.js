/**
 * Central Photography Blogger configuration — same pattern as
 * client/src/config/blog.js, kept separate since it's a different Blogger
 * blog. Used only for the optional "View photography archive" link; actual
 * photo data always comes from the same-origin /api/photography endpoint
 * (see lib/api.js), never fetched directly from Blogger by the client.
 */
import { normalizeBlogUrl } from "../lib/blogUrl";

export const PHOTOGRAPHY_BLOG_URL = normalizeBlogUrl(
  import.meta.env.VITE_PHOTOGRAPHY_BLOGGER_URL || "",
);
export const isPhotographyBlogConfigured = PHOTOGRAPHY_BLOG_URL !== null;
