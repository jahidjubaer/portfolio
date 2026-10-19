import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";

const HEADING_STYLES = {
  2: "heading-lg mt-8 first:mt-0",
  3: "heading-md mt-7 first:mt-0",
  4: "mt-6 font-semibold first:mt-0",
  5: "mt-5 font-semibold first:mt-0",
  6: "mt-5 font-semibold first:mt-0",
};

/**
 * Markdown heading levels are shifted so they nest under the page's own
 * headings: with `baseLevel` 3, "# Title" renders as an <h3>.
 */
function makeHeading(markdownLevel, baseLevel) {
  const level = Math.min(6, markdownLevel + baseLevel - 1);
  const Tag = `h${level}`;
  function Heading({ node: _node, className, ...props }) {
    return (
      <Tag
        {...props}
        className={cn(
          "text-(--color-text-primary)",
          HEADING_STYLES[level],
          className,
        )}
      />
    );
  }
  return Heading;
}

function MarkdownLink({ node: _node, href = "", children, ...props }) {
  const className =
    "font-medium text-(--color-text-primary) underline decoration-(--color-accent-primary) underline-offset-3 hover:decoration-2";
  if (href.startsWith("/")) {
    return (
      <Link to={href} className={className} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={className}
      target={href.startsWith("#") ? undefined : "_blank"}
      rel={href.startsWith("#") ? undefined : "noreferrer"}
      {...props}
    >
      {children}
    </a>
  );
}

function strip(Tag, className) {
  function Element({ node: _node, className: extra, ...props }) {
    return <Tag {...props} className={cn(className, extra)} />;
  }
  return Element;
}

function buildComponents(baseLevel) {
  return {
    h1: makeHeading(1, baseLevel),
    h2: makeHeading(2, baseLevel),
    h3: makeHeading(3, baseLevel),
    h4: makeHeading(4, baseLevel),
    h5: makeHeading(5, baseLevel),
    h6: makeHeading(6, baseLevel),
    a: MarkdownLink,
    p: strip("p", "mt-4 first:mt-0"),
    ul: strip("ul", "mt-4 list-disc space-y-2 pl-5 first:mt-0"),
    ol: strip("ol", "mt-4 list-decimal space-y-2 pl-5 first:mt-0"),
    li: strip("li", "pl-1 marker:text-(--color-text-muted)"),
    strong: strip("strong", "font-semibold text-(--color-text-primary)"),
    blockquote: strip(
      "blockquote",
      "mt-4 border-l-2 border-(--color-accent-fill) pl-4 italic first:mt-0",
    ),
    hr: strip("hr", "my-8 border-(--color-border)"),
    code: strip(
      "code",
      "rounded-(--radius-sm) bg-(--color-surface-raised) px-1.5 py-0.5 font-mono text-[0.875em] text-(--color-text-primary)",
    ),
    pre: strip(
      "pre",
      "mt-4 overflow-x-auto rounded-(--radius-md) border border-(--color-border) bg-(--color-surface-raised) p-4 text-sm first:mt-0 [&_code]:bg-transparent [&_code]:p-0",
    ),
    img: ({ node: _node, alt = "", ...props }) => (
      <img
        {...props}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="mt-4 h-auto max-w-full rounded-(--radius-md) border border-(--color-border)"
      />
    ),
  };
}

const COMPONENTS_BY_LEVEL = new Map();

/**
 * Renders trusted-author Markdown (case studies, posts) with the site's
 * typography. Raw HTML in the source is not rendered and unsafe link
 * protocols are dropped (react-markdown's defaults).
 * @param {{ children: string, baseLevel?: 2 | 3 | 4, className?: string }} props
 */
export function Markdown({ children, baseLevel = 3, className }) {
  if (!COMPONENTS_BY_LEVEL.has(baseLevel)) {
    COMPONENTS_BY_LEVEL.set(baseLevel, buildComponents(baseLevel));
  }
  return (
    <div className={cn("prose-body text-(--color-text-secondary)", className)}>
      <ReactMarkdown components={COMPONENTS_BY_LEVEL.get(baseLevel)}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
