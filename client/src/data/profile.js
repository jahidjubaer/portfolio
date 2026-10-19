import { assetManifest } from "../generated/asset-manifest";

/**
 * Verified identity and contact data, sourced from CONTENT_CHECKLIST.md.
 * Never invent a value here — use `null` and hide the dependent UI instead.
 */
export const profile = {
  name: "Jahid Hasan",
  monogram: "JH.",
  title: "Frontend Developer & Junior Software Engineer",
  supportingDirection:
    "React-focused engineer expanding into full-stack systems and AI-enabled products.",
  location: "Sylhet, Bangladesh",
  // Target roles confirmed by Jahid (2026-10-18). Frontend and junior
  // software engineering stay primary; MTO and technical management are
  // entry-level management-track roles, backed by his leadership record.
  targetRoles: [
    "Frontend Developer",
    "Junior Software Engineer",
    "Management Trainee Officer (MTO)",
    "Technical management roles",
  ],
  availabilityStatement:
    "Open to frontend developer, junior software engineer, MTO, and technical management roles.",
  // Profile "About" section. Built only from verified facts already in
  // this file, projects.js, and leadership.js.
  about: [
    "I'm Jahid Hasan, a React-focused frontend developer and junior software engineer from Sylhet, building accessible, responsive interfaces while expanding into full-stack systems and AI-enabled products.",
    "I've built multi-role products end to end, including Sarabo, an electronics-repair service platform, and ICT Crack, a Bangla-first learning platform for HSC students. Outside code, I've held leadership roles in my university's sports club and photographic society.",
  ],
  availabilityDetail:
    "Frontend developer and junior software engineer roles, plus MTO and technical management tracks. Based in Sylhet, Bangladesh.",
  heroHeadline: "I build clear interfaces for real product problems.",
  heroSupport:
    "I'm Jahid Hasan, a React-focused frontend developer and junior software engineer from Sylhet, building accessible, responsive interfaces while expanding into full-stack systems and AI-enabled products.",
  email: "jahidhasan.metro@gmail.com",
  github: "https://github.com/jahidjubaer",
  linkedin: "https://www.linkedin.com/in/jahidjubaer/",
  codeforces: "https://codeforces.com/profile/jahidjubaer17",
  leetcode: "https://leetcode.com/u/jahidjubaer/",
  education: {
    degree: "BSc in Computer Science and Engineering",
    university: "Metropolitan University, Sylhet",
    graduation: "August 2026",
  },
  problemSolving: {
    total: "250+ programming problems solved",
    primaryLanguage: "C++",
    platforms: "VJudge, Codeforces, Dimik OJ, and LeetCode",
  },
  // Availability and URL come from the generated asset manifest (the single
  // source of truth for what asset files actually exist on disk) — never
  // duplicate this as a separate hardcoded boolean.
  resume: {
    available: assetManifest.resume.available,
    filename: "jahid-hasan-resume.pdf",
    url: assetManifest.resume.available ? assetManifest.resume.src : null,
    // Matches the "Updated" line printed inside the PDF itself
    // (regenerated 2026-09-29 from checklist-verified content).
    updatedLabel: "Updated September 2026",
  },
};

/**
 * Public profiles in display order (right rail "Find me on", footer,
 * contact page). Derived from `profile` so URLs live in one place.
 * @type {Array<{ id: "github" | "linkedin" | "codeforces" | "leetcode", label: string, handle: string, url: string }>}
 */
export const socialProfiles = [
  {
    id: "github",
    label: "GitHub",
    handle: "@jahidjubaer",
    url: profile.github,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "in/jahidjubaer",
    url: profile.linkedin,
  },
  {
    id: "codeforces",
    label: "Codeforces",
    handle: "jahidjubaer17",
    url: profile.codeforces,
  },
  {
    id: "leetcode",
    label: "LeetCode",
    handle: "jahidjubaer",
    url: profile.leetcode,
  },
];
