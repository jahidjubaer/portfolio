import { RoutePlaceholder } from "~/components/ui/route-placeholder";

import type { Route } from "./+types/about";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "About — Jahid Hasan" },
    {
      name: "description",
      content:
        "Biography, engineering principles, education, and evidence for Jahid Hasan. Full content arrives in Phase 6.",
    },
  ];
}

export default function About() {
  return (
    <RoutePlaceholder
      eyebrow="About"
      heading="About Jahid"
      description="This section is prepared for Phase 6 implementation."
      phaseNote="About and professional evidence — Phase 6 (docs/05-implementation-roadmap.md)."
    />
  );
}
