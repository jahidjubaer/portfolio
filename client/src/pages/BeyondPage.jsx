import {
  Camera,
  Heart,
  Languages,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { PAGE_META } from "../routes/route-meta";
import { Container } from "../components/ui/Container";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Surface } from "../components/ui/Surface";
import { Tag } from "../components/ui/Tag";
import { Divider } from "../components/ui/Divider";
import { Reveal } from "../features/motion/Reveal";
import { PhotographyGallery } from "../features/photography/PhotographyGallery";
import { photographs } from "../data/photography";
import { leadershipRoles } from "../data/leadership";
import {
  interests,
  languages,
  sportsHighlights,
  volunteeringHighlights,
} from "../data/beyond";
import { PageHeader, PageHeaderTitle } from "../components/layout/PageHeader";
import { siteSettings } from "../data/settings";
import { ExternalSiteCard } from "../features/showcase/ExternalSiteCard";

const showcase = siteSettings.showcase.photos;

export function BeyondPage() {
  usePageMeta(PAGE_META["/beyond"]);
  // A few samples; the full photo journal lives on the original site.
  const samplePhotos = photographs.slice(0, showcase.limit);

  return (
    <>
      <PageHeader>
        <PageHeaderTitle>Beyond</PageHeaderTitle>
      </PageHeader>
      <Container as="div" className="section-spacing max-w-5xl">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-(--radius-pill) border border-(--color-border) bg-(--color-surface-soft) px-3.5 py-1 text-xs font-mono text-(--color-accent-secondary)">
            <Sparkles size={13} />
            <span>STORY / BEYOND THE CODE</span>
          </div>

          <h1 className="heading-xl mt-3 text-(--color-text-primary)">
            Beyond the code.
          </h1>
          <p className="body-lg mt-4 max-w-2xl text-(--color-text-secondary)">
            Outside of software engineering, I&apos;m passionate about visual
            storytelling through photography, leading campus sports tournaments,
            and active community volunteering.
          </p>
        </Reveal>

        {/* Photography Section */}
        <section className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-(--color-border) pb-4">
            <div className="flex items-center gap-2 text-(--color-text-primary)">
              <Camera size={20} className="text-(--color-accent-primary)" />
              <h2 className="heading-md text-(--color-text-primary)">
                Photography Showcase
              </h2>
            </div>
          </div>

          {samplePhotos.length > 0 ? (
            <div className="mt-6">
              <PhotographyGallery photographs={samplePhotos} />
            </div>
          ) : (
            <Surface variant="raised" className="mt-6 p-10 text-center">
              <Camera size={36} className="mx-auto text-(--color-text-muted)" />
              <p className="body-md mt-3 text-(--color-text-secondary)">
                A curated photography selection is being prepared.
              </p>
            </Surface>
          )}

          {showcase.siteUrl ? (
            <ExternalSiteCard
              className="mt-6"
              href={showcase.siteUrl}
              label={showcase.siteLabel ?? "the photo journal"}
              description={showcase.siteDescription}
              icon={Camera}
              count={{
                shown: samplePhotos.length,
                total: photographs.length,
                noun: "photos",
              }}
            />
          ) : null}
        </section>

        <Divider className="my-14" />

        {/* Sports & Campus Activities */}
        <section>
          <div className="flex items-center gap-2 border-b border-(--color-border) pb-4">
            <Trophy size={20} className="text-(--color-accent-secondary)" />
            <h2 className="heading-md text-(--color-text-primary)">
              Sports & Athletics Leadership
            </h2>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-1">
            {sportsHighlights.map((item) => (
              <Surface key={item.title} variant="raised" className="p-6">
                <h3 className="heading-md text-(--color-text-primary)">
                  {item.title}
                </h3>
                <p className="body-sm mt-2 text-(--color-text-secondary)">
                  {item.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </Surface>
            ))}
          </div>
        </section>

        <Divider className="my-14" />

        {/* Club Leadership */}
        <section>
          <div className="flex items-center gap-2 border-b border-(--color-border) pb-4">
            <Users size={20} className="text-(--color-accent-primary)" />
            <h2 className="heading-md text-(--color-text-primary)">
              University Club Leadership
            </h2>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {leadershipRoles.map((role) => (
              <Surface
                key={`${role.organization}-${role.role}`}
                variant="default"
                className="p-6 transition-all hover:border-(--color-accent-primary)/50"
              >
                <span className="mono-meta text-xs text-(--color-accent-primary)">
                  {role.dates}
                </span>
                <h3 className="heading-md mt-1 text-(--color-text-primary)">
                  {role.role}
                </h3>
                <p className="body-sm font-medium text-(--color-text-secondary)">
                  {role.organization}
                </p>
                <p className="body-sm mt-3 text-(--color-text-muted)">
                  {role.description}
                </p>
              </Surface>
            ))}
          </div>
        </section>

        <Divider className="my-14" />

        {/* Volunteering & Community */}
        <section>
          <div className="flex items-center gap-2 border-b border-(--color-border) pb-4">
            <Heart size={20} className="text-(--color-danger)" />
            <h2 className="heading-md text-(--color-text-primary)">
              Volunteering & Social Impact
            </h2>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-1">
            {volunteeringHighlights.map((item) => (
              <Surface key={item.organization} variant="raised" className="p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="heading-md text-(--color-text-primary)">
                    {item.organization}
                  </h3>
                  <span className="mono-meta text-xs text-(--color-text-muted)">
                    {item.period}
                  </span>
                </div>
                <p className="body-sm mt-2 text-(--color-text-secondary)">
                  {item.description}
                </p>
                {item.tags.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                ) : null}
              </Surface>
            ))}
          </div>
        </section>

        {languages.length > 0 || interests.length > 0 ? (
          <>
            <Divider className="my-14" />

            {/* Languages & interests */}
            <section aria-labelledby="languages-heading">
              <div className="flex items-center gap-2 border-b border-(--color-border) pb-4">
                <Languages
                  size={20}
                  aria-hidden="true"
                  className="text-(--color-accent-primary)"
                />
                <h2
                  id="languages-heading"
                  className="heading-md text-(--color-text-primary)"
                >
                  Languages &amp; interests
                </h2>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {languages.length > 0 ? (
                  <Surface variant="raised" className="p-6">
                    <h3 className="font-semibold text-(--color-text-primary)">
                      Languages
                    </h3>
                    <dl className="mt-3 grid gap-2.5">
                      {languages.map((language) => (
                        <div
                          key={language.name}
                          className="flex flex-wrap items-baseline justify-between gap-x-3"
                        >
                          <dt className="font-medium text-(--color-text-primary)">
                            {language.name}
                          </dt>
                          <dd className="text-sm text-(--color-text-secondary)">
                            {language.level}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </Surface>
                ) : null}
                {interests.length > 0 ? (
                  <Surface variant="raised" className="p-6">
                    <h3 className="font-semibold text-(--color-text-primary)">
                      Interests
                    </h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <li key={interest}>
                          <Tag>{interest}</Tag>
                        </li>
                      ))}
                    </ul>
                  </Surface>
                ) : null}
              </div>
            </section>
          </>
        ) : null}

        <Divider className="my-14" />

        {/* Connect CTA */}
        <Reveal as="section">
          <Surface
            variant="raised"
            className="p-8 text-center border border-(--color-border)"
          >
            <h2 className="heading-md text-(--color-text-primary)">
              Interested in collaborating?
            </h2>
            <p className="body-sm mx-auto mt-3 max-w-prose text-(--color-text-secondary)">
              Whether it&apos;s frontend engineering, creative photography
              projects, or sports initiatives — let&apos;s get in touch.
            </p>
            <div className="mt-6">
              <ButtonLink to="/contact" variant="primary">
                Get in touch
              </ButtonLink>
            </div>
          </Surface>
        </Reveal>
      </Container>
    </>
  );
}
