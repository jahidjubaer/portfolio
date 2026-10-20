import { Code } from "lucide-react";
import {
  FacebookIcon,
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
} from "./BrandIcons";

const BRAND_ICONS = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
};

/**
 * Icon for an entry in `socialProfiles`. The judges (Codeforces, VJudge,
 * LeetCode) have no brand mark here, so they share a generic code glyph.
 * @param {{ id: string, size?: number, className?: string }} props
 */
export function SocialIcon({ id, size = 18, className }) {
  const Brand = BRAND_ICONS[id];
  if (Brand) return <Brand size={size} className={className} />;
  return <Code size={size} className={className} aria-hidden="true" />;
}
