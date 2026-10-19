import { Code } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "./BrandIcons";

/**
 * Icon for an entry in `socialProfiles`. Codeforces and LeetCode have no
 * brand mark here, so they share a generic code glyph.
 * @param {{ id: string, size?: number, className?: string }} props
 */
export function SocialIcon({ id, size = 18, className }) {
  if (id === "github") return <GitHubIcon size={size} className={className} />;
  if (id === "linkedin") {
    return <LinkedInIcon size={size} className={className} />;
  }
  return <Code size={size} className={className} aria-hidden="true" />;
}
