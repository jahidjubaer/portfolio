import { RoutePlaceholder } from "~/components/ui/route-placeholder";

import type { Route } from "./+types/index";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Selected Work — Jahid Hasan" },
    {
      name: "description",
      content:
        "Case studies and web projects by Jahid Hasan. Project data and listings arrive in Phase 5.",
    },
  ];
}

export default function WorkIndex() {
  return (
    <RoutePlaceholder
      eyebrow="Work"
      heading="Selected work"
      description="This section is prepared for Phase 5 implementation."
      phaseNote="Work index and case-study system — Phase 5 (docs/05-implementation-roadmap.md). Project data will be sourced from app/data/projects.ts."
    />
  );
}
