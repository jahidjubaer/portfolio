import { Link } from "react-router-dom";
import { FocusBrackets } from "../../components/ui/FocusBrackets";
import { Surface } from "../../components/ui/Surface";
import { Tag } from "../../components/ui/Tag";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { formatPostDate } from "../../data/posts";
import { cn } from "../../lib/cn";
import { detectTextLanguage } from "../../lib/language";

const POST_PLACEHOLDER = "/assets/placeholders/learning-placeholder.svg";

/**
 * A post in the Writing index. The whole card is one link (the title's,
 * stretched), so it's a single tab stop.
 * @param {{
 *   post: import("../../data/posts").Post,
 *   headingLevel?: "h2" | "h3",
 *   priorityImage?: boolean,
 *   className?: string,
 * }} props  `priorityImage`: the first card on the Writing page, whose
 *   cover is the page's largest paint — never lazy-loaded.
 */
export function PostCard({
  post,
  headingLevel = "h3",
  priorityImage = false,
  className,
}) {
  const HeadingTag = headingLevel;

  return (
    <Surface
      as="article"
      className={cn(
        "has-brackets relative flex h-full flex-col p-6 transition-colors focus-within:border-(--color-accent-primary) hover:border-(--color-border-strong)",
        className,
      )}
    >
      <FocusBrackets />
      <div className="-mx-6 -mt-6 mb-6 aspect-video overflow-hidden rounded-t-(--radius-md) border-b border-(--color-border)">
        <ImageWithFallback
          src={post.cover?.url}
          fallbackSrc={POST_PLACEHOLDER}
          // The title right below says what the post is.
          alt=""
          width={post.cover?.width}
          height={post.cover?.height}
          className="h-full w-full object-cover"
          loading={priorityImage ? "eager" : "lazy"}
          fetchPriority={priorityImage ? "high" : undefined}
        />
      </div>

      <time
        dateTime={post.publishedAt}
        className="mono-meta text-(--color-text-muted)"
      >
        {formatPostDate(post.publishedAt)}
      </time>

      <HeadingTag className="heading-md mt-2 text-(--color-text-primary)">
        <Link
          to={`/writing/${post.slug}`}
          lang={detectTextLanguage(post.title)}
          className="after:absolute after:inset-0 after:rounded-(--radius-md) after:content-[''] hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {post.title}
        </Link>
      </HeadingTag>

      <p
        lang={detectTextLanguage(post.excerpt)}
        className="body-sm mt-2 line-clamp-4 flex-1 text-(--color-text-secondary)"
      >
        {post.excerpt}
      </p>

      {post.tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
          {post.tags.map((tag) => (
            <li key={tag} lang={detectTextLanguage(tag)}>
              <Tag>{tag}</Tag>
            </li>
          ))}
        </ul>
      ) : null}
    </Surface>
  );
}
