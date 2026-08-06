import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionLabel } from "../components/ui/SectionLabel";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Divider } from "../components/ui/Divider";
import { Reveal } from "../features/motion/Reveal";
import { PhotographyGallery } from "../features/photography/PhotographyGallery";
import { getAllPhotographs } from "../features/photography/photography-selectors";
import { leadershipRoles } from "../data/leadership";

// Verified sports involvement — see CONTENT_CHECKLIST.md section 10.
// Kept as a small list rather than invented statistics, trophies, or dates.
const SPORTS_HIGHLIGHTS = [
  "Organizing and umpiring university cricket, football, and indoor sports competitions with the Metropolitan University Sports Club.",
];

// Verified volunteering — see CONTENT_CHECKLIST.md section 10. Kept
// compact since exact responsibilities and outcomes are not yet confirmed.
const VOLUNTEERING_HIGHLIGHTS = ["Red Crescent Youth (RCY), 2019–2021."];

export function BeyondPage() {
  usePageMeta({
    title: "Beyond the Code — Jahid Hasan",
    description:
      "Photography, sports, leadership, and volunteering by Jahid Hasan.",
  });

  const photographs = getAllPhotographs();

  return (
    <Container as="div" className="section-spacing">
      <Reveal>
        <SectionLabel>Beyond the Code</SectionLabel>
        <h1 className="display-lg mt-3 text-(--color-text-primary)">
          Beyond the code
        </h1>
        <p className="body-lg mt-6 max-w-prose text-(--color-text-secondary)">
          Outside of engineering, I&apos;m involved in photography, cricket and
          sports leadership, university club organisation, and volunteering.
          Here&apos;s an honest look at what&apos;s confirmed today.
        </p>
      </Reveal>

      <section className="mt-16">
        <h2 className="heading-md text-(--color-text-primary)">Photography</h2>
        {photographs.length > 0 ? (
          <div className="mt-6">
            <PhotographyGallery photographs={photographs} />
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-4 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-10 text-center">
            <img
              src="/assets/placeholders/photography-placeholder.svg"
              alt=""
              aria-hidden="true"
              className="h-20 w-20 opacity-70"
            />
            <p className="body-md max-w-prose text-(--color-text-secondary)">
              A curated photography selection is being prepared.
            </p>
          </div>
        )}
      </section>

      <Divider className="my-16" />

      <section>
        <h2 className="heading-md text-(--color-text-primary)">Sports</h2>
        <ul className="mt-4 space-y-3">
          {SPORTS_HIGHLIGHTS.map((item) => (
            <li key={item} className="body-sm text-(--color-text-secondary)">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="heading-md text-(--color-text-primary)">Leadership</h2>
        <ul className="mt-6 space-y-6">
          {leadershipRoles.map((role) => (
            <li key={`${role.organization}-${role.role}-${role.dates}`}>
              <p className="text-(--color-text-primary)">
                <span className="font-semibold">{role.role}</span> &mdash;{" "}
                {role.organization}{" "}
                <span className="mono-meta text-(--color-text-muted)">
                  ({role.dates})
                </span>
              </p>
              <p className="body-sm mt-1 text-(--color-text-secondary)">
                {role.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="heading-md text-(--color-text-primary)">Volunteering</h2>
        <ul className="mt-4 space-y-3">
          {VOLUNTEERING_HIGHLIGHTS.map((item) => (
            <li key={item} className="body-sm text-(--color-text-secondary)">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <Divider className="my-16" />

      <Reveal as="section" className="text-center">
        <h2 className="heading-md text-(--color-text-primary)">
          Interested in connecting?
        </h2>
        <p className="body-sm mx-auto mt-3 max-w-prose text-(--color-text-secondary)">
          I&apos;m open to conversations about frontend and software engineering
          opportunities, as well as photography and sports collaborations.
        </p>
        <div className="mt-6">
          <ButtonLink to="/contact" variant="secondary">
            Get in touch
          </ButtonLink>
        </div>
      </Reveal>
    </Container>
  );
}
