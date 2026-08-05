import { RoutePlaceholder } from "~/components/ui/route-placeholder";

import type { Route } from "./+types/home";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Jahid Hasan — Frontend Developer & Junior Software Engineer" },
    {
      name: "description",
      content:
        "Portfolio foundation for Jahid Hasan, a frontend developer and junior software engineer. Full homepage experience arrives in Phase 4.",
    },
  ];
}

export default function Home() {
  return (
    <RoutePlaceholder
      eyebrow="Jahid Hasan"
      heading="Portfolio foundation"
      description="This section is prepared for Phase 4 implementation."
      phaseNote="Home experience — Phase 4 (docs/05-implementation-roadmap.md)."
      showHomeLink={false}
    />
  );
}
