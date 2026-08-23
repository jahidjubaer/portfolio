import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ImageWithFallback } from "../../src/components/media/ImageWithFallback";

describe("ImageWithFallback", () => {
  it("renders the primary src initially", () => {
    render(
      <ImageWithFallback
        src="/assets/profile/profile-portrait.webp"
        fallbackSrc="/assets/placeholders/profile-placeholder.svg"
        alt="Portrait of Jahid Hasan"
      />,
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/assets/profile/profile-portrait.webp",
    );
  });

  it("switches to the fallback src when the primary image fails to load", () => {
    render(
      <ImageWithFallback
        src="/assets/profile/missing.webp"
        fallbackSrc="/assets/placeholders/profile-placeholder.svg"
        alt="Portrait of Jahid Hasan"
      />,
    );
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/assets/placeholders/profile-placeholder.svg",
    );
  });

  it("does not loop forever if the fallback also fails", () => {
    render(
      <ImageWithFallback
        src="/assets/profile/missing.webp"
        fallbackSrc="/assets/placeholders/also-missing.svg"
        alt="Portrait of Jahid Hasan"
      />,
    );
    const image = screen.getByRole("img");
    fireEvent.error(image);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("defaults to lazy loading with async decoding", () => {
    render(
      <ImageWithFallback
        src="/assets/profile/profile-portrait.webp"
        fallbackSrc="/assets/placeholders/profile-placeholder.svg"
        alt="Portrait of Jahid Hasan"
      />,
    );
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).toHaveAttribute("decoding", "async");
    expect(image).not.toHaveAttribute("fetchpriority");
  });

  it("passes fetchPriority through for a genuine LCP candidate", () => {
    render(
      <ImageWithFallback
        src="/assets/profile/profile-portrait.webp"
        fallbackSrc="/assets/placeholders/profile-placeholder.svg"
        alt="Portrait of Jahid Hasan"
        loading="eager"
        fetchPriority="high"
      />,
    );
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("loading", "eager");
    expect(image).toHaveAttribute("fetchpriority", "high");
  });
});
