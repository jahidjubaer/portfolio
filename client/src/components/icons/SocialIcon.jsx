import { Code } from "lucide-react";
import {
  CodeforcesIcon,
  FacebookIcon,
  GitHubIcon,
  InstagramIcon,
  LeetCodeIcon,
  LinkedInIcon,
  VJudgeIcon,
} from "./BrandIcons";

const BRAND_ICONS = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  codeforces: CodeforcesIcon,
  leetcode: LeetCodeIcon,
  vjudge: VJudgeIcon,
};

/**
 * Icon for an entry in `socialProfiles`. An unknown id falls back to a
 * generic code glyph.
 * @param {{ id: string, size?: number, className?: string }} props
 */
export function SocialIcon({ id, size = 18, className }) {
  const Brand = BRAND_ICONS[id];
  if (Brand) return <Brand size={size} className={className} />;
  return <Code size={size} className={className} aria-hidden="true" />;
}
