import { profile as storedProfile } from "../generated/content.json";
import { assetManifest } from "../generated/asset-manifest";

const {
  socialProfiles: storedSocialProfiles,
  resume,
  ...fields
} = storedProfile;

// A site path ("/assets/…") only counts when the file is really in the
// build (the asset manifest checks the disk); an uploaded Blob URL always
// does.
const resumeAvailable =
  Boolean(resume.url) &&
  (!resume.url.startsWith("/") || assetManifest.resume.available);

/**
 * Identity and contact data, edited in the admin panel and read from the
 * published content snapshot (see generated/content.json). Never invent a
 * value — leave it out and hide the dependent UI instead.
 */
export const profile = {
  ...fields,
  resume: {
    ...resume,
    available: resumeAvailable,
    url: resumeAvailable ? resume.url : null,
  },
};

/**
 * Public profiles in display order (right rail "Find me on", footer,
 * contact page). Profiles marked hidden in the admin stay out.
 * @type {Array<{ id: "github" | "linkedin" | "codeforces" | "vjudge" | "leetcode" | "facebook" | "instagram", label: string, handle: string, url: string }>}
 */
export const socialProfiles = storedSocialProfiles.filter(
  (social) => !social.hidden,
);
