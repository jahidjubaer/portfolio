import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionLabel } from "../components/ui/SectionLabel";
import { leadershipRoles } from "../data/leadership";

const BEYOND_AREAS = [
  {
    title: "Photography",
    description:
      "Photo walks and event coverage with the Metropolitan University Photographic Society. A curated gallery is being prepared.",
  },
  {
    title: "Sports leadership",
    description:
      "Organizing and umpiring university cricket, football, and indoor sports competitions with the Metropolitan University Sports Club.",
  },
  {
    title: "University club organisation",
    description:
      "Executive-committee roles coordinating event planning, member communication, and program delivery.",
  },
  {
    title: "Volunteering",
    description: "Red Crescent Youth (RCY), 2019–2021.",
  },
];

export function BeyondPage() {
  usePageMeta({
    title: "Beyond the Code — Jahid Hasan",
    description:
      "Photography, sports, leadership, and volunteering by Jahid Hasan.",
  });

  return (
    <Container className="py-20">
      <SectionLabel>Beyond the Code</SectionLabel>
      <h1 className="mt-3 text-3xl font-semibold text-(--color-text) sm:text-4xl">
        Beyond the code
      </h1>
      <p className="mt-6 max-w-prose text-(--color-text-muted)">
        Outside of engineering, I'm involved in photography, sports leadership,
        and university organisations. This part of the site is being prepared —
        the full photography gallery and story content will follow in a later
        phase. Here's an honest look at what's confirmed today.
      </p>

      <ul className="mt-12 grid gap-6 sm:grid-cols-2">
        {BEYOND_AREAS.map((area) => (
          <li
            key={area.title}
            className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6"
          >
            <h2 className="text-lg font-semibold text-(--color-text)">
              {area.title}
            </h2>
            <p className="mt-2 text-sm text-(--color-text-muted)">
              {area.description}
            </p>
          </li>
        ))}
      </ul>

      <section className="mt-16">
        <h2 className="text-sm font-semibold tracking-wide text-(--color-text) uppercase">
          Roles
        </h2>
        <ul className="mt-6 space-y-4">
          {leadershipRoles.map((role) => (
            <li
              key={`${role.organization}-${role.role}-${role.dates}`}
              className="text-sm text-(--color-text-muted)"
            >
              <span className="font-semibold text-(--color-text)">
                {role.role}
              </span>{" "}
              — {role.organization} ({role.dates})
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
