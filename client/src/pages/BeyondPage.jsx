import { BookOpen, Camera, Sparkles } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { PAGE_META } from "../routes/route-meta";
import { Container } from "../components/ui/Container";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Surface } from "../components/ui/Surface";
import { FrameRule } from "../components/ui/FrameRule";
import { Divider } from "../components/ui/Divider";
import { Reveal } from "../features/motion/Reveal";
import { PhotographyGallery } from "../features/photography/PhotographyGallery";
import { photographs } from "../data/photography";
import { books } from "../data/books";
import { ReadingSection } from "../features/books/ReadingSection";
import { PageHeader, PageHeaderTitle } from "../components/layout/PageHeader";
import { siteSettings } from "../data/settings";
import { ExternalSiteCard } from "../features/showcase/ExternalSiteCard";

const showcase = siteSettings.showcase.photos;

export function BeyondPage() {
  usePageMeta(PAGE_META["/beyond"]);
  // A few samples; the full photo journal lives on the original site.
  const samplePhotos = photographs.slice(0, showcase.limit);

  return (
    // Beyond is the personal side: a warm darkroom "safelight" accent
    // (data-mood in accents.css) and a faint film grain.
    <div data-mood="story" className="film-grain">
      <PageHeader>
        <PageHeaderTitle>Beyond</PageHeaderTitle>
      </PageHeader>
      <Container as="div" className="section-spacing max-w-5xl">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-(--radius-pill) border border-(--color-border) bg-(--color-surface-soft) px-3.5 py-1 text-xs font-mono text-(--color-accent-primary)">
            <Sparkles size={13} />
            <span>STORY / BEYOND THE CODE</span>
          </div>

          <h1 className="heading-xl mt-3 text-(--color-text-primary)">
            Beyond the code.
          </h1>
          <p className="body-lg mt-4 max-w-2xl text-(--color-text-secondary)">
            What I do with a camera and a book.
          </p>
        </Reveal>

        {/* Photography Section */}
        <section className="mt-14">
          <div className="flex">
            <div className="flex flex-1 items-center gap-2 text-(--color-text-primary)">
              <Camera size={20} className="text-(--color-accent-primary)" />
              <h2 className="frame-heading heading-md flex flex-1 items-baseline gap-3 text-(--color-text-primary)">
                Photography Showcase
              </h2>
            </div>
          </div>
          <FrameRule className="mt-3" />

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

        {books ? (
          <>
            <Divider className="my-14" />
            <section aria-labelledby="reading-heading">
              <div className="flex items-center gap-2">
                <BookOpen
                  size={20}
                  aria-hidden="true"
                  className="text-(--color-accent-primary)"
                />
                <h2
                  id="reading-heading"
                  className="frame-heading heading-md flex flex-1 items-baseline gap-3 text-(--color-text-primary)"
                >
                  Reading
                </h2>
              </div>
              <FrameRule className="mt-3" />
              <div className="mt-6">
                <ReadingSection books={books} />
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
              Whether it&apos;s frontend work, a photography project, or a book
              worth reading, I&apos;d like to hear from you.
            </p>
            <div className="mt-6">
              <ButtonLink to="/contact" variant="primary">
                Get in touch
              </ButtonLink>
            </div>
          </Surface>
        </Reveal>
      </Container>
    </div>
  );
}
