import { StaggerGroup, StaggerItem } from "../motion/StaggerGroup";
import { LearningPostCard } from "./LearningPostCard";

/**
 * @param {{
 *   posts: import("../../lib/api").LearningPost[],
 *   headingLevel?: "h2" | "h3",
 * }} props
 */
export function LearningPostGrid({ posts, headingLevel = "h3" }) {
  return (
    <StaggerGroup as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <StaggerItem key={post.id} as="li">
          <LearningPostCard post={post} headingLevel={headingLevel} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
