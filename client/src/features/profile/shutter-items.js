import { projectsUsing } from "./skill-projects";

/**
 * What the banner's shutter can photograph (docs/14 R6): every public
 * project and every headline technology, each standing on one of the
 * banner's bokeh lights. Nothing here exists only in the banner; every
 * item is also on the page.
 *
 * @typedef {{
 *   id: string,
 *   kind: "project" | "skill",
 *   name: string,
 *   slug?: string,
 *   summary?: string,
 *   learning?: boolean,
 *   usedIn?: Array<{ slug: string, title: string }>,
 *   x: number,
 *   y: number,
 * }} ShutterItem  `x`, `y`: the light's centre, as fractions of the banner.
 */

/**
 * Lights an item may stand on: not behind the portrait (bottom centre) or
 * the Shoot button (top centre), so every item can be reached and seen.
 * @param {number[][]} bokeh  [x, y, radius, tone] per light
 */
export function freeLights(bokeh) {
  return bokeh.filter(([x, y]) => {
    const behindPortrait = x > 0.36 && x < 0.64 && y > 0.5;
    const behindButton = x > 0.42 && x < 0.58 && y < 0.3;
    return !behindPortrait && !behindButton;
  });
}

/**
 * Projects and technologies interleaved (a project, then two
 * technologies), so consecutive shots alternate, placed on the free
 * lights from left to right. Items beyond the number of lights are left
 * out of the banner; they're still on the page.
 * @param {{
 *   projects: Array<{ slug: string, title: string, summary: string, stack: string[] }>,
 *   tech: Array<{ name: string, learning: boolean }>,
 *   bokeh: number[][],
 * }} input
 * @returns {ShutterItem[]}
 */
export function buildShutterItems({ projects, tech, bokeh }) {
  const projectItems = projects.map((project) => ({
    id: `project:${project.slug}`,
    kind: "project",
    name: project.title,
    slug: project.slug,
    summary: project.summary,
  }));
  const skillItems = tech.map(({ name, learning }) => ({
    id: `skill:${name}`,
    kind: "skill",
    name,
    learning,
    usedIn: projectsUsing(name, projects),
  }));

  const ordered = [];
  let p = 0;
  let s = 0;
  while (p < projectItems.length || s < skillItems.length) {
    if (p < projectItems.length) ordered.push(projectItems[p++]);
    for (let i = 0; i < 2 && s < skillItems.length; i += 1) {
      ordered.push(skillItems[s++]);
    }
  }

  const lights = [...freeLights(bokeh)].sort((a, b) => a[0] - b[0]);
  // Spread the items over all the lights rather than crowding the left.
  const stride = Math.max(1, lights.length / ordered.length);
  return ordered.slice(0, lights.length).map((item, index) => {
    const [x, y] = lights[Math.floor(index * stride)];
    return { ...item, x, y };
  });
}

/**
 * The item whose light is nearest a point in the banner, if one is within
 * `reach` pixels.
 * @param {ShutterItem[]} items
 * @param {{ x: number, y: number }} point  in pixels
 * @param {{ width: number, height: number, reach: number }} size
 * @returns {ShutterItem | null}
 */
export function itemAt(items, point, { width, height, reach }) {
  let best = null;
  let bestDistance = reach;
  for (const item of items) {
    const distance = Math.hypot(
      item.x * width - point.x,
      item.y * height - point.y,
    );
    if (distance <= bestDistance) {
      best = item;
      bestDistance = distance;
    }
  }
  return best;
}
