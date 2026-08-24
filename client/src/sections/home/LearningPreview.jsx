import { SectionHeader } from "../../components/ui/SectionHeader";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { Container } from "../../components/ui/Container";
import { useLearningPosts } from "../../features/learning/useLearningPosts";
import { LearningPostGrid } from "../../features/learning/LearningPostGrid";

const PREVIEW_COUNT = 3;

/**
 * Homepage "Latest Learning" strip. Milestone 7 explicitly forbids showing
 * placeholder cards here while loading, unconfigured, or empty — this
 * section simply omits itself in every state except real published posts,
 * rather than making the homepage longer with a state nobody asked to see.
 */
export function LearningPreview() {
  const { status, configured, posts } = useLearningPosts();

  if (status !== "loaded" || !configured || posts.length === 0) return null;

  const preview = posts.slice(0, PREVIEW_COUNT);

  return (
    <section className="section-spacing border-b border-(--color-border)">
      <Container>
        <SectionHeader
          label="Learning Log"
          heading="Latest Learning"
          description="Notes from what I'm learning, building and figuring out along the way."
        />
        <div className="mt-12">
          <LearningPostGrid posts={preview} headingLevel="h3" />
        </div>
        <div className="mt-10">
          <ButtonLink to="/learning" variant="secondary">
            View all learning →
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
