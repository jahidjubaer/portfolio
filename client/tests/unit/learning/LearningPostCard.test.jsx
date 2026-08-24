import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LearningPostCard } from "../../../src/features/learning/LearningPostCard";

const post = {
  id: "post-a",
  title: "Learning React Server Components",
  url: "https://jahid-notes.blogspot.com/post-a.html",
  publishedAt: "2026-01-15T10:00:00.000-08:00",
  updatedAt: "2026-01-15T10:00:00.000-08:00",
  excerpt: "A short excerpt about server components.",
  thumbnail: "https://blogger.googleusercontent.com/img/a/s640/photo.jpg",
  labels: ["React", "Notes"],
};

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <LearningPostCard post={{ ...post, ...props }} />
    </MemoryRouter>,
  );
}

describe("LearningPostCard", () => {
  it("links the title to the real Blogger permalink, opened safely in a new tab", () => {
    renderCard();
    const link = screen.getByRole("link", { name: post.title });
    expect(link).toHaveAttribute("href", post.url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the publication date as a semantic <time> element", () => {
    renderCard();
    const time = screen.getByText("January 15, 2026");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("dateTime", post.publishedAt);
  });

  it("omits the <time> element when no published date exists", () => {
    renderCard({ publishedAt: null });
    expect(document.querySelector("time")).not.toBeInTheDocument();
  });

  it("uses the real thumbnail when one is provided", () => {
    renderCard();
    expect(screen.getByRole("img")).toHaveAttribute("src", post.thumbnail);
  });

  it("falls back to the learning placeholder when no thumbnail exists", () => {
    renderCard({ thumbnail: null });
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/assets/placeholders/learning-placeholder.svg",
    );
  });

  it("renders each label", () => {
    renderCard();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("omits the label list entirely when there are none", () => {
    renderCard({ labels: [] });
    expect(document.querySelectorAll("ul")).toHaveLength(0);
  });

  it("has an accessible 'Read article' link pointing to the same permalink", () => {
    renderCard();
    const readLink = screen.getByRole("link", { name: /read article/i });
    expect(readLink).toHaveAttribute("href", post.url);
    expect(readLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("marks a Bengali title with lang='bn'", () => {
    renderCard({ title: "জাভা স্ক্রিপ্ট পরিচিতি পর্ব" });
    const titleLink = screen.getByRole("link", {
      name: "জাভা স্ক্রিপ্ট পরিচিতি পর্ব",
    });
    expect(titleLink).toHaveAttribute("lang", "bn");
  });

  it("does not mark an English title with lang='bn'", () => {
    renderCard();
    const titleLink = screen.getByRole("link", { name: post.title });
    expect(titleLink).not.toHaveAttribute("lang");
  });

  it("marks a Bengali excerpt with lang='bn'", () => {
    renderCard({ excerpt: "আজকে আমরা শুরু করবো জাভা স্ক্রিপ্ট।" });
    const excerpt = screen.getByText("আজকে আমরা শুরু করবো জাভা স্ক্রিপ্ট।");
    expect(excerpt).toHaveAttribute("lang", "bn");
  });

  it("does not mark an English excerpt with lang='bn'", () => {
    renderCard();
    const excerpt = screen.getByText(post.excerpt);
    expect(excerpt).not.toHaveAttribute("lang");
  });

  it("marks a Bengali label with lang='bn' while leaving an English label unmarked", () => {
    renderCard({ labels: ["জাভা স্ক্রিপ্ট", "React"] });
    const bengaliLabelItem = screen.getByText("জাভা স্ক্রিপ্ট").closest("li");
    const englishLabelItem = screen.getByText("React").closest("li");
    expect(bengaliLabelItem).toHaveAttribute("lang", "bn");
    expect(englishLabelItem).not.toHaveAttribute("lang");
  });

  it("never marks the 'Read article' link or dates with lang='bn', even on a Bengali post", () => {
    renderCard({
      title: "জাভা স্ক্রিপ্ট পরিচিতি পর্ব",
      excerpt: "আজকে আমরা শুরু করবো জাভা স্ক্রিপ্ট।",
    });
    const readLink = screen.getByRole("link", { name: /read article/i });
    const time = screen.getByText("January 15, 2026");
    expect(readLink).not.toHaveAttribute("lang");
    expect(time).not.toHaveAttribute("lang");
  });
});
