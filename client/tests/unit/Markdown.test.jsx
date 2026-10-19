import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Markdown } from "../../src/components/ui/Markdown";

function renderMarkdown(source, props) {
  return render(
    <MemoryRouter>
      <Markdown {...props}>{source}</Markdown>
    </MemoryRouter>,
  );
}

describe("Markdown", () => {
  it("nests headings under the page's own", () => {
    renderMarkdown("# Top\n\n## Next", { baseLevel: 3 });
    expect(screen.getByRole("heading", { level: 3, name: "Top" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { level: 4, name: "Next" }),
    ).toBeTruthy();
  });

  it("renders lists and emphasis", () => {
    renderMarkdown("- **Customer** — submits requests\n- Technician");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Customer").tagName).toBe("STRONG");
  });

  it("opens external links in a new tab and keeps site links in the app", () => {
    renderMarkdown("[GitHub](https://github.com) and [work](/work)");
    const external = screen.getByRole("link", { name: "GitHub" });
    expect(external).toHaveAttribute("target", "_blank");
    expect(external).toHaveAttribute("rel", "noreferrer");
    const internal = screen.getByRole("link", { name: "work" });
    expect(internal).toHaveAttribute("href", "/work");
    expect(internal).not.toHaveAttribute("target");
  });

  it("does not render raw HTML or script links", () => {
    const { container } = renderMarkdown(
      '<img src=x onerror="alert(1)"> [click](javascript:alert(1))',
    );
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("click").getAttribute("href") ?? "").not.toMatch(
      /javascript/i,
    );
  });

  it("lazy-loads images with their alt text", () => {
    renderMarkdown("![A chart](https://example.com/chart.webp)");
    const image = screen.getByRole("img", { name: "A chart" });
    expect(image).toHaveAttribute("loading", "lazy");
  });
});
