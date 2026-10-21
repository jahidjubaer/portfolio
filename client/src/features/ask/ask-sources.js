import { projects } from "../../data/projects";
import { posts } from "../../data/posts";

const PAGE_LABELS = {
  "/": "Profile",
  "/work": "Projects",
  "/credentials": "Education & Certifications",
  "/resume": "Resume",
  "/learning": "Learning",
  "/writing": "Writing",
  "/beyond": "Beyond",
  "/contact": "Contact",
};

/**
 * The link text for a page an answer came from: the project or post
 * title, or the page's name.
 * @param {string} path
 */
export function sourceLabel(path) {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  const [, section, slug] = path.split("/");
  if (section === "work") {
    return projects.find((project) => project.slug === slug)?.title ?? path;
  }
  if (section === "writing") {
    return posts.find((post) => post.slug === slug)?.title ?? path;
  }
  return path;
}
