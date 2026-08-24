import { ArrowUpRight } from "lucide-react";
import { Surface } from "../../components/ui/Surface";
import { TextLink } from "../../components/ui/TextLink";
import { Tag } from "../../components/ui/Tag";
import { VisuallyHidden } from "../../components/ui/VisuallyHidden";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { cn } from "../../lib/cn";

const LEARNING_PLACEHOLDER = "/assets/placeholders/learning-placeholder.svg";

function formatPublishedDate(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    // Fixed to UTC so the displayed calendar day is the same for every
    // reader regardless of their local timezone, rather than shifting near
    // a day boundary depending on where the page happens to be viewed.
    timeZone: "UTC",
  });
}

/**
 * A single Blogger post shown as a card. Never renders the full article —
 * only the normalized summary fields from /api/blog/posts — and always
 * links out to the original Blogger permalink.
 * @param {{
 *   post: import("../../lib/api").LearningPost,
 *   headingLevel?: "h2" | "h3",
 *   className?: string,
 * }} props
 */
export function LearningPostCard({
  post,
  headingLevel = "h3",
  className = "",
}) {
  const HeadingTag = headingLevel;
  const displayDate = formatPublishedDate(post.publishedAt);

  return (
    <Surface as="article" className={cn("flex flex-col p-6", className)}>
      <div className="-mx-6 -mt-6 mb-6 aspect-video overflow-hidden rounded-t-(--radius-md) border-b border-(--color-border)">
        <ImageWithFallback
          src={post.thumbnail}
          fallbackSrc={LEARNING_PLACEHOLDER}
          alt={`${post.title} thumbnail`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {displayDate ? (
        <time
          dateTime={post.publishedAt}
          className="mono-meta text-(--color-text-muted)"
        >
          {displayDate}
        </time>
      ) : null}

      <HeadingTag className="heading-md mt-2 text-(--color-text-primary)">
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline focus-visible:underline"
        >
          {post.title}
        </a>
      </HeadingTag>

      <p className="body-sm mt-2 flex-1 text-(--color-text-secondary)">
        {post.excerpt}
      </p>

      {post.labels.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {post.labels.map((label) => (
            <li key={label}>
              <Tag>{label}</Tag>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4">
        <TextLink
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1"
        >
          Read article
          <ArrowUpRight aria-hidden="true" size={14} />
          <VisuallyHidden>(opens in a new tab, on Blogger)</VisuallyHidden>
        </TextLink>
      </div>
    </Surface>
  );
}
