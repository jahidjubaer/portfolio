import { TECH_LOGOS } from "../../components/icons/tech-logos";
import { capabilityGroups } from "../../data/capabilities";
import { profile } from "../../data/profile";

const strengths = capabilityGroups.find(
  (group) => group.id === "current-strengths",
);
const expanding = capabilityGroups.find(
  (group) => group.id === "currently-expanding",
);

/**
 * Headline stack (every technology with a logo): today's strengths, the
 * competitive-programming language, then the back-end tools being learned.
 * Shown on the profile's film strip and as items in the banner's shutter.
 * @type {Array<{ name: string, learning: boolean }>}
 */
export const HEADLINE_TECH = [
  ...strengths.items
    .filter((item) => TECH_LOGOS[item])
    .map((name) => ({ name, learning: false })),
  { name: profile.problemSolving.primaryLanguage, learning: false },
  ...expanding.items
    .filter((item) => TECH_LOGOS[item])
    .map((name) => ({ name, learning: true })),
];
