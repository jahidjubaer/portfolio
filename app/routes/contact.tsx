import { RoutePlaceholder } from "~/components/ui/route-placeholder";

import type { Route } from "./+types/contact";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Contact — Jahid Hasan" },
    {
      name: "description",
      content:
        "Get in touch with Jahid Hasan. The contact form arrives in Phase 8.",
    },
  ];
}

export default function Contact() {
  return (
    <RoutePlaceholder
      eyebrow="Contact"
      heading="Contact"
      description="This section is prepared for Phase 8 implementation."
      phaseNote="Contact and conversion — Phase 8 (docs/05-implementation-roadmap.md)."
    />
  );
}
