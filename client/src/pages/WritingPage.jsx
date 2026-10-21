import { useState } from "react";
import { NotebookPen, PenLine, Rss } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { PAGE_META } from "../routes/route-meta";
import { Container } from "../components/ui/Container";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Surface } from "../components/ui/Surface";
import { isBlogPost, posts, yearSpan } from "../data/posts";
import { PostGrid } from "../features/writing/PostGrid";
import { TagFilter } from "../features/writing/TagFilter";
import { filterByTag } from "../features/writing/filter-by-tag";
import { PageHeader, PageHeaderTitle } from "../components/layout/PageHeader";
import { siteSettings } from "../data/settings";
import { ExternalSiteCard } from "../features/showcase/ExternalSiteCard";

const showcase = siteSettings.showcase.posts;

export function WritingPage() {
  const [selectedTag, setSelectedTag] = useState("All");

  usePageMeta(PAGE_META["/writing"]);

  const notes = posts.filter((post) => !isBlogPost(post));
  const blog = posts.filter(isBlogPost);
  const { tags, filtered: filteredPosts } = filterByTag(notes, selectedTag);
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

        {tags.length > 0 ? (
          <TagFilter
            className="mt-8"
            tags={tags}
            selected={selectedTag}
            onSelect={setSelectedTag}
          />
        ) : null}

        <div className="mt-10">
          {notes.length > 0 ? (
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

        {posts.length > 0 ? (
          <p className="mt-6">
            <a
              href="/rss.xml"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-(--color-text-secondary) underline decoration-(--color-border-strong) underline-offset-4 hover:text-(--color-text-primary) hover:decoration-(--color-accent-primary)"
            >
              <Rss size={15} aria-hidden="true" />
              Follow by RSS
            </a>
          </p>
        ) : null}

        {showcase.siteUrl && notes.length > 0 ? (
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

        {blog.length > 0 ? <BlogSection posts={blog} /> : null}
      </Container>
    </>
  );
}

/**
 * The personal blog (docs/14 R5): older Bangla writing, below the learning
 * notes and filtered on its own.
 * @param {{ posts: import("../data/posts").Post[] }} props
 */
function BlogSection({ posts: blogPosts }) {
  const [selectedTag, setSelectedTag] = useState("All");
  const { tags, filtered } = filterByTag(blogPosts, selectedTag);

  return (
    <section
      id="blog"
      aria-labelledby="blog-heading"
      className="mt-20 scroll-mt-24 border-t border-(--color-border) pt-14"
    >
      <SectionHeader
        id="blog-heading"
        label="Personal"
        heading="Blog"
        description={`My personal blog, written in Bangla, ${yearSpan(blogPosts)}.`}
      />
      {tags.length > 0 ? (
        <TagFilter
          className="mt-8"
          label="Filter the blog by tag"
          tags={tags}
          selected={selectedTag}
          onSelect={setSelectedTag}
        />
      ) : null}
      <div className="mt-10">
        <PostGrid posts={filtered} headingLevel="h3" />
      </div>
    </section>
  );
}
