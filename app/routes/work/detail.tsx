import { RoutePlaceholder } from "~/components/ui/route-placeholder";
import { isKnownProjectSlug } from "~/lib/project-slug";

import type { Route } from "./+types/detail";

export function meta({ params }: Route.MetaArgs) {
  const isKnown = isKnownProjectSlug(params.slug);
  return [
    {
      title: isKnown
        ? "Project preview — Jahid Hasan"
        : "Project not found — Jahid Hasan",
    },
    {
      name: "description",
      content: isKnown
        ? "Dynamic project route validation placeholder for Phase 1."
        : "The requested project could not be found.",
    },
  ];
}

export default function WorkDetail({ params }: Route.ComponentProps) {
  if (!isKnownProjectSlug(params.slug)) {
    return (
      <RoutePlaceholder
        eyebrow="Work"
        heading="Project not found"
        description="No project matches this address. Project data will be introduced in Phase 5 via app/data/projects.ts, along with generated static paths for every real project slug."
        phaseNote="Work case-study system — Phase 5 (docs/05-implementation-roadmap.md)."
      />
    );
  }

  return (
    <RoutePlaceholder
      eyebrow="Work"
      heading="Project route validation"
      description="This route confirms that dynamic /work/:slug segments render correctly. Real case studies are prepared for Phase 5 implementation."
      phaseNote="Work case-study system — Phase 5 (docs/05-implementation-roadmap.md)."
    />
  );
}
