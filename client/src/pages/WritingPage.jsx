import { useState } from "react";
import { NotebookPen, PenLine } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { PAGE_META } from "../routes/route-meta";
import { Container } from "../components/ui/Container";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Surface } from "../components/ui/Surface";
import { cn } from "../lib/cn";
import { detectTextLanguage } from "../lib/language";
import { posts } from "../data/posts";
import { PostGrid } from "../features/writing/PostGrid";
import { PageHeader, PageHeaderTitle } from "../components/layout/PageHeader";
import { siteSettings } from "../data/settings";
import { ExternalSiteCard } from "../features/showcase/ExternalSiteCard";

const showcase = siteSettings.showcase.posts;

export function WritingPage() {
  const [selectedTag, setSelectedTag] = useState("All");

  usePageMeta(PAGE_META["/writing"]);

  const tags = [...new Set(posts.flatMap((post) => post.tags))];
  // Only worth showing once there is real variety to filter — a single
  // tag (or none) would just be a control that does nothing useful.
  const showFilters = tags.length >= 2;
  const filteredPosts =
    showFilters && selectedTag !== "All"
      ? posts.filter((post) => post.tags.includes(selectedTag))
      : posts;
  // A sample of the newest notes; the full archive is on the original blog.
  const visiblePosts = filteredPosts.slice(0, showcase.limit);

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

        {showFilters ? (
          <div
            role="group"
            aria-label="Filter by tag"
            className="mt-8 flex flex-wrap gap-2"
          >
            {["All", ...tags].map((tag) => (
              <button
                key={tag}
                type="button"
                aria-pressed={selectedTag === tag}
                onClick={() => setSelectedTag(tag)}
                lang={detectTextLanguage(tag)}
                className={cn(
                  "min-touch-target rounded-(--radius-pill) border px-4 py-2 text-sm transition-colors",
                  selectedTag === tag
                    ? "border-(--color-accent-primary) bg-(--color-accent-primary-soft) font-semibold text-(--color-accent-primary)"
                    : "border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text-primary)",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-10">
          {posts.length > 0 ? (
            <PostGrid posts={visiblePosts} headingLevel="h2" />
          ) : (
            <Surface variant="raised" className="p-10 text-center">
              <PenLine
                size={32}
                className="mx-auto text-(--color-text-muted)"
              />
              <p className="body-md mt-3 text-(--color-text-secondary)">
                No posts yet. The first notes are on their way.
              </p>
            </Surface>
          )}
        </div>

        {showcase.siteUrl ? (
          <ExternalSiteCard
            className="mt-8"
            href={showcase.siteUrl}
            label={showcase.siteLabel ?? "the original blog"}
            description={showcase.siteDescription}
            icon={NotebookPen}
            count={{
              shown: visiblePosts.length,
              total: filteredPosts.length,
              noun: "posts",
            }}
          />
        ) : null}
      </Container>
    </>
  );
}
