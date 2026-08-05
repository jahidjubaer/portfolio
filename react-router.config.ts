import type { Config } from "@react-router/dev/config";

// Dynamic project paths (/work/:slug) are added here from app/data/projects.ts
// once real project data exists (Phase 5). Phase 1 has no verified project
// data source, so no project slugs are pre-rendered yet.
export default {
  ssr: false,
  async prerender() {
    return ["/", "/work", "/about", "/beyond", "/contact", "/resume"];
  },
} satisfies Config;
