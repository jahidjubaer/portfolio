import { StaggerGroup, StaggerItem } from "../motion/StaggerGroup";
import { PostCard } from "./PostCard";

/**
 * @param {{
 *   posts: import("../../data/posts").Post[],
 *   headingLevel?: "h2" | "h3",
 * }} props
 */
export function PostGrid({ posts, headingLevel = "h3" }) {
  return (
    <StaggerGroup as="ul" className="grid gap-6 sm:grid-cols-2">
      {posts.map((post, index) => (
        <StaggerItem key={post.slug} as="li">
          <PostCard
            post={post}
            headingLevel={headingLevel}
            priorityImage={index === 0}
          />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
