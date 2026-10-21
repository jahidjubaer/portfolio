import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { usePageMeta } from "../hooks/usePageMeta";
import { postMeta } from "../routes/route-meta";
import { Container } from "../components/ui/Container";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Markdown } from "../components/ui/Markdown";
import { Tag } from "../components/ui/Tag";
import { Reveal } from "../features/motion/Reveal";
import { ReadingProgressBar } from "../features/projects/ReadingProgressBar";
import { formatPostDate, getPost, originalSiteName } from "../data/posts";
import { detectTextLanguage } from "../lib/language";

/**
 * Header for post routes: a back link to the index. The article owns the
 * H1, so the label here is plain text.
 */
function PostPageHeader() {
  return (
    <PageHeader>
      <Link
        to="/writing"
        aria-label="Back to writing"
        className="grid size-11 shrink-0 place-items-center rounded-full text-(--color-text-secondary) transition-colors hover:bg-(--color-surface-raised) hover:text-(--color-text-primary)"
      >
        <ArrowLeft size={20} aria-hidden="true" />
      </Link>
      <p className="text-[1.0625rem] font-semibold text-(--color-text-muted)">
        Writing
      </p>
    </PageHeader>
  );
}

function PostNotFound({ slug }) {
  usePageMeta({
    title: "Post not found — Jahid Hasan",
    description: "This post doesn't exist or has moved.",
    robots: "noindex, follow",
  });

  return (
    <>
      <PostPageHeader />
      <Container as="div" className="section-spacing text-center">
        <h1 className="heading-xl text-(--color-text-primary)">
          Post not found
        </h1>
        <p className="body-md mx-auto mt-4 max-w-prose text-(--color-text-secondary)">
          No post matches &quot;{slug}&quot;.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink to="/writing" variant="primary">
            All writing
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}

/** @param {{ post: import("../data/posts").Post }} props */
function PostArticle({ post }) {
  const meta = postMeta(post);
  usePageMeta({ ...meta, image: post.cover?.url });
  const lang = detectTextLanguage(post.title + post.excerpt);

  return (
    <>
      <PostPageHeader />
      <ReadingProgressBar />
      <Container as="div" className="section-spacing max-w-3xl">
        <article lang={lang}>
          <Reveal>
            <time
              dateTime={post.publishedAt}
              className="mono-meta text-(--color-text-muted)"
            >
              {formatPostDate(post.publishedAt)}
            </time>
            <h1 className="heading-xl mt-3 text-(--color-text-primary)">
              {post.title}
            </h1>
            {post.tags.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Tag>{tag}</Tag>
                  </li>
                ))}
              </ul>
            ) : null}
            {post.originalUrl ? (
              <p className="mt-4 text-sm text-(--color-text-muted)" lang="en">
                First published on{" "}
                <a
                  href={post.originalUrl}
                  className="underline decoration-(--color-border-strong) underline-offset-4 hover:text-(--color-text-primary) hover:decoration-(--color-accent-primary)"
                >
                  {originalSiteName(post.originalUrl)}
                </a>
              </p>
            ) : null}
          </Reveal>

          {/* A cover that also appears in the text isn't shown twice. */}
          {post.cover && !post.body.includes(post.cover.url) ? (
            <img
              src={post.cover.url}
              alt={post.coverAlt}
              width={post.cover.width}
              height={post.cover.height}
              fetchPriority="high"
              className="mt-8 h-auto w-full rounded-(--radius-md) border border-(--color-border)"
            />
          ) : null}

          <Markdown baseLevel={2} className="body-md mt-8">
            {post.body}
          </Markdown>
        </article>

        <div className="mt-14 border-t border-(--color-border) pt-8">
          <ButtonLink to="/writing" variant="secondary">
            All writing
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}

export function PostPage() {
  const { slug } = useParams();
  const post = getPost(slug);
  return post ? <PostArticle post={post} /> : <PostNotFound slug={slug} />;
}
