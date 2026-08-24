import { usePageMeta } from "../hooks/usePageMeta";
import { Container } from "../components/ui/Container";
import { SectionLabel } from "../components/ui/SectionLabel";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Divider } from "../components/ui/Divider";
import { StatusIndicator } from "../components/ui/StatusIndicator";
import { Reveal } from "../features/motion/Reveal";
import { StaggerGroup, StaggerItem } from "../features/motion/StaggerGroup";
import { ImageWithFallback } from "../components/media/ImageWithFallback";
import { Timeline } from "../features/timeline/Timeline";
import { profile } from "../data/profile";
import { capabilityGroups } from "../data/capabilities";
import { assetManifest } from "../generated/asset-manifest";

export function AboutPage() {
  usePageMeta({
    title: "About — Jahid Hasan",
    description:
      "Biography, principles, capabilities, education, and leadership experience of Jahid Hasan, a frontend developer and junior software engineer.",
  });

  return (
    <Container as="div" className="section-spacing">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        <Reveal>
          <SectionLabel>About</SectionLabel>
          <h1 className="heading-xl mt-3 text-(--color-text-primary)">
            About Jahid
          </h1>
          <p className="body-md mt-2 font-medium text-(--color-text-primary)">
            {profile.title}
          </p>
          <p className="body-lg mt-4 max-w-prose text-(--color-text-secondary)">
            {profile.heroSupport}
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface)">
            <ImageWithFallback
              src={assetManifest.profile.portraitSquare.src}
              fallbackSrc={assetManifest.profile.portraitSquare.fallback}
              alt="Portrait of Jahid Hasan"
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </Reveal>
      </div>

      <Divider className="my-16" />

      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal as="section">
          <h2 className="label text-(--color-text-muted)">Education</h2>
          <p className="heading-md mt-3 text-(--color-text-primary)">
            {profile.education.degree}
          </p>
          <p className="body-sm mt-1 text-(--color-text-secondary)">
            {profile.education.university} &middot;{" "}
            {profile.education.graduation}
          </p>

          <h2 className="label mt-10 text-(--color-text-muted)">
            Problem solving
          </h2>
          <p className="body-sm mt-3 text-(--color-text-secondary)">
            {profile.problemSolving.total}, primarily in{" "}
            {profile.problemSolving.primaryLanguage}, across{" "}
            {profile.problemSolving.platforms}.
          </p>

          <h2 className="label mt-10 text-(--color-text-muted)">
            Current direction
          </h2>
          <p className="body-sm mt-3 max-w-prose text-(--color-text-secondary)">
            {profile.supportingDirection}
          </p>
        </Reveal>

        <section>
          <h2 className="label text-(--color-text-muted)">Capabilities</h2>
          <StaggerGroup as="div" className="mt-6 grid gap-8 sm:grid-cols-2">
            {capabilityGroups.map((group) => (
              <StaggerItem key={group.id}>
                <h3 className="text-sm font-semibold text-(--color-text-primary)">
                  {group.title}
                </h3>
                <ul className="mt-3 space-y-2 border-l border-(--color-border) pl-4">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="body-sm text-(--color-text-secondary)"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      </div>

      <Divider className="my-16" />

      <section>
        <h2 className="label text-(--color-text-muted)">Timeline</h2>
        <p className="body-sm mt-3 max-w-prose text-(--color-text-secondary)">
          Verified milestones — leadership roles, volunteering, and education —
          in chronological order.
        </p>
        <div className="mt-8">
          <Timeline />
        </div>
      </section>

      <Divider className="my-16" />

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <StatusIndicator tone="positive">
          {profile.availabilityStatement}
        </StatusIndicator>
        <ButtonLink to="/contact" variant="secondary">
          Get in touch
        </ButtonLink>
      </div>
    </Container>
  );
}
