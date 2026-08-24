import { profile } from "../../data/profile";
import { projects } from "../../data/projects";

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   category: "Navigation" | "Project" | "External" | "Action",
 *   action:
 *     | { type: "navigate", to: string }
 *     | { type: "external", href: string }
 *     | { type: "download", href: string, filename: string },
 * }} Command
 */

const NAV_ROUTES = [
  { label: "Home", to: "/" },
  { label: "Work", to: "/work" },
  { label: "Learning", to: "/learning" },
  { label: "About", to: "/about" },
  { label: "Beyond", to: "/beyond" },
  { label: "Contact", to: "/contact" },
  { label: "Résumé", to: "/resume" },
];

/**
 * Every command here is derived from real routes/data — never a fake
 * action. A command only appears when its target genuinely exists (e.g.
 * "Download résumé" is omitted entirely while no résumé file is available).
 * @returns {Command[]}
 */
export function getCommands() {
  const commands = NAV_ROUTES.map((route) => ({
    id: `nav-${route.to}`,
    label: route.label,
    category: "Navigation",
    action: { type: "navigate", to: route.to },
  }));

  const sarabo = projects.find((project) => project.slug === "sarabo");
  if (sarabo) {
    commands.push({
      id: "project-sarabo",
      label: `Open ${sarabo.title}`,
      category: "Project",
      action: { type: "navigate", to: `/work/${sarabo.slug}` },
    });
  }

  if (profile.github) {
    commands.push({
      id: "external-github",
      label: "GitHub",
      category: "External",
      action: { type: "external", href: profile.github },
    });
  }

  if (profile.linkedin) {
    commands.push({
      id: "external-linkedin",
      label: "LinkedIn",
      category: "External",
      action: { type: "external", href: profile.linkedin },
    });
  }

  if (profile.resume.available) {
    commands.push({
      id: "action-download-resume",
      label: "Download résumé",
      category: "Action",
      action: {
        type: "download",
        href: profile.resume.url,
        filename: profile.resume.filename,
      },
    });
  }

  return commands;
}

const CATEGORY_ORDER = ["Navigation", "Project", "External", "Action"];

/**
 * Case-insensitive substring match against label and category — enough for
 * a short, hand-authored command list; no fuzzy-matching library needed.
 * Diacritics are stripped before comparing (e.g. "resume" must still find
 * "Résumé") since that's how most people actually type a quick search.
 * @param {string} text
 * @returns {string}
 */
function foldForSearch(text) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * @param {Command[]} commands
 * @param {string} query
 * @returns {Command[]}
 */
export function filterCommands(commands, query) {
  const normalized = foldForSearch(query.trim());
  if (!normalized) return commands;
  return commands.filter(
    (command) =>
      foldForSearch(command.label).includes(normalized) ||
      foldForSearch(command.category).includes(normalized),
  );
}

/**
 * Groups already-filtered commands by category, in a fixed display order,
 * omitting empty groups.
 * @param {Command[]} commands
 * @returns {Array<{ category: string, commands: Command[] }>}
 */
export function groupCommandsByCategory(commands) {
  return CATEGORY_ORDER.map((category) => ({
    category,
    commands: commands.filter((command) => command.category === category),
  })).filter((group) => group.commands.length > 0);
}
