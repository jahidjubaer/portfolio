import { index, route, type RouteConfig } from "@react-router/dev/routes";

// Route identity classification (docs/01-master-product-design-spec.md):
// SYSTEM: /, /work, /work/:slug, /about, /contact, /resume, /*
// STORY:  /beyond
export default [
  index("routes/home.tsx"),
  route("work", "routes/work/index.tsx"),
  route("work/:slug", "routes/work/detail.tsx"),
  route("about", "routes/about.tsx"),
  route("beyond", "routes/beyond.tsx"),
  route("contact", "routes/contact.tsx"),
  route("resume", "routes/resume.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
