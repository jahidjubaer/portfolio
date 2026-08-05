
import { RoutePlaceholder } from "~/components/ui/route-placeholder";

import type { Route } from "./+types/resume";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Résumé — Jahid Hasan" },
    {
      name: "description",
      content:
        "Résumé summary and download for Jahid Hasan. The résumé asset and full page arrive in Phase 6.",
    },
  ];
}

export default function Resume() {
  return (
    <RoutePlaceholder
      eyebrow="Résumé"
      heading="Résumé"
      description="This section is prepared for Phase 6 implementation. No résumé file is currently published."
      phaseNote="About and professional evidence — Phase 6 (docs/05-implementation-roadmap.md)."
    />
  );
}
