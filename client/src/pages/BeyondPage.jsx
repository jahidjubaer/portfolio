import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionLabel } from "../components/ui/SectionLabel";
import { Reveal } from "../features/motion/Reveal";
import { StaggerGroup, StaggerItem } from "../features/motion/StaggerGroup";
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
    <Container as="div" className="section-spacing">
      <Reveal>
        <SectionLabel>Beyond the Code</SectionLabel>
        <h1 className="display-lg mt-3 text-(--color-text-primary)">
          Beyond the code
        </h1>
        <p className="body-lg mt-6 max-w-prose text-(--color-text-secondary)">
          Outside of engineering, I&apos;m involved in photography, sports
          leadership, and university organisations. This part of the site is
          being prepared — the full photography gallery and story content will
          follow in a later phase. Here&apos;s an honest look at what&apos;s
          confirmed today.
        </p>
      </Reveal>

      <StaggerGroup as="ul" className="mt-14 grid gap-6 sm:grid-cols-2">
        {BEYOND_AREAS.map((area) => (
          <StaggerItem
            key={area.title}
            as="li"
            className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-6"
          >
            <h2 className="heading-md text-(--color-text-primary)">
              {area.title}
            </h2>
            <p className="body-sm mt-2 text-(--color-text-secondary)">
              {area.description}
            </p>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <section className="mt-16">
        <h2 className="label text-(--color-text-muted)">Roles</h2>
        <ul className="mt-6 space-y-4">
          {leadershipRoles.map((role) => (
            <li
              key={`${role.organization}-${role.role}-${role.dates}`}
              className="body-sm text-(--color-text-secondary)"
            >
              <span className="font-semibold text-(--color-text-primary)">
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
