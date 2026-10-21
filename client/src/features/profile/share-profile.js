import { siteConfig } from "../../config/site";

/**
 * Shares the profile URL: the native share sheet on touch devices that have
 * one, otherwise the clipboard.
 * @returns {Promise<"shared" | "copied" | null>} null when dismissed or blocked
 */
export async function shareProfile() {
  const url = siteConfig.url;
  try {
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      await navigator.share({ title: siteConfig.title, url });
      return "shared";
    }
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return null;
  }
}
