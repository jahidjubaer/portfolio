import { RoutePlaceholder } from "~/components/ui/route-placeholder";

import type { Route } from "./+types/beyond";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Beyond the Code — Jahid Hasan" },
    {
      name: "description",
      content:
        "Photography, sports, and leadership work by Jahid Hasan, outside of software engineering. Full STORY experience arrives in Phase 7.",
    },
  ];
}

export default function Beyond() {
  return (
    <RoutePlaceholder
      eyebrow="Beyond the code"
      heading="Beyond the code"
      description="This section is prepared for Phase 7 implementation."
      phaseNote="STORY identity and Beyond experience — Phase 7 (docs/05-implementation-roadmap.md)."
    />
  );
}
