import { useMemo, useState } from "react";
import { usePageMeta } from "../hooks/usePageMeta";
import { PAGE_META } from "../routes/route-meta";
import { Container } from "../components/ui/Container";
import { SectionHeader } from "../components/ui/SectionHeader";
import { TextLink } from "../components/ui/TextLink";
import { cn } from "../lib/cn";
import { detectTextLanguage } from "../lib/language";
import { useLearningPosts } from "../features/learning/useLearningPosts";
import { LearningPostGrid } from "../features/learning/LearningPostGrid";
import { LearningPostsState } from "../features/learning/LearningPostsState";
import { BLOG_URL, isBlogConfigured } from "../config/blog";
import { PageHeader, PageHeaderTitle } from "../components/layout/PageHeader";

function deriveDisplayState({ status, configured, posts }) {
  if (status === "loading") return "loading";
  if (status === "error") return "error";
  if (!configured) return "config-missing";
  if (posts.length === 0) return "empty";
  return "posts";
}

export function WritingPage() {
  const { status, configured, posts, message, retry } = useLearningPosts();
  const [selectedLabel, setSelectedLabel] = useState("All");

  usePageMeta(PAGE_META["/writing"]);

  const displayState = deriveDisplayState({ status, configured, posts });

  const labels = useMemo(() => {
    const unique = new Set();
    for (const post of posts) {
      for (const label of post.labels) unique.add(label);
    }
    return Array.from(unique);
  }, [posts]);

  // Only worth showing once there is real variety to filter — a single
  // label (or none) would just be a control that does nothing useful.
  const showFilters = displayState === "posts" && labels.length >= 2;

  const visiblePosts =
    showFilters && selectedLabel !== "All"
      ? posts.filter((post) => post.labels.includes(selectedLabel))
      : posts;

  return (
    <>
      <PageHeader>
        <PageHeaderTitle>Writing</PageHeaderTitle>
      </PageHeader>
      <Container as="div" className="section-spacing">
        <SectionHeader
          as="h1"
          label="Learning Log"
          heading="Blog / Learning"
          description="Notes from what I'm learning, building and figuring out along the way."
        />
        <p className="body-sm mt-4 max-w-prose text-(--color-text-muted)">
          Long-form posts are published on Blogger.{" "}
          {isBlogConfigured ? (
            <TextLink href={BLOG_URL} target="_blank" rel="noopener noreferrer">
              Visit all posts ↗
            </TextLink>
          ) : null}
        </p>

        {showFilters ? (
          <div
            role="group"
            aria-label="Filter by label"
            className="mt-8 flex flex-wrap gap-2"
          >
            {["All", ...labels].map((label) => (
              <button
                key={label}
                type="button"
                aria-pressed={selectedLabel === label}
                onClick={() => setSelectedLabel(label)}
                lang={detectTextLanguage(label)}
                className={cn(
                  "rounded-(--radius-pill) border px-3 py-1 font-mono text-xs transition-colors",
                  selectedLabel === label
                    ? "border-(--color-accent-primary) bg-(--color-accent-primary-soft) font-semibold text-(--color-accent-primary)"
                    : "border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text-primary)",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-10">
          {displayState === "posts" ? (
            <LearningPostGrid posts={visiblePosts} headingLevel="h2" />
          ) : (
            <LearningPostsState
              status={displayState}
              message={message}
              onRetry={retry}
            />
          )}
        </div>
      </Container>
    </>
  );
}
