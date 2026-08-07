import { useEffect } from "react";
import { siteConfig, absoluteUrl } from "../config/site";

/**
 * Upserts an element matched by `selector`; if it must be created, the
 * attributes in `identify` mark it (e.g. name/property/rel). Returns a
 * restore function that puts the tag back exactly how it was found.
 */
function upsertTag({ selector, tagName, identify, attr, value }) {
  let el = document.head.querySelector(selector);
  const created = !el;
  if (!el) {
    el = document.createElement(tagName);
    for (const [key, val] of Object.entries(identify)) {
      el.setAttribute(key, val);
    }
    document.head.appendChild(el);
  }
  const previous = el.getAttribute(attr);
  el.setAttribute(attr, value);

  return () => {
    if (created) {
      el.remove();
    } else if (previous !== null) {
      el.setAttribute(attr, previous);
    } else {
      el.removeAttribute(attr);
    }
  };
}

function upsertMeta(name, content, useProperty = false) {
  const key = useProperty ? "property" : "name";
  return upsertTag({
    selector: `meta[${key}="${name}"]`,
    tagName: "meta",
    identify: { [key]: name },
    attr: "content",
    value: content,
  });
}

/**
 * Manages per-route document head metadata for this client-rendered SPA:
 * title, description, canonical, Open Graph, Twitter Card, and robots.
 * No react-helmet — this is a small, focused effect that restores every
 * tag it touched on unmount so route changes never leak stale metadata.
 *
 * Backwards compatible: `usePageMeta({ title, description })` still works.
 * `path` defaults to the current pathname; pass `robots: "noindex, follow"`
 * for routes that must not be indexed (unknown/error/not-found states).
 *
 * @param {{
 *   title: string,
 *   description: string,
 *   path?: string,
 *   image?: string,
 *   type?: string,
 *   robots?: string,
 * }} head
 */
export function usePageMeta({
  title,
  description,
  path,
  image,
  type = "website",
  robots,
}) {
  useEffect(() => {
    const resolvedPath =
      path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
    const canonical = absoluteUrl(resolvedPath);
    const ogImage = absoluteUrl(image ?? siteConfig.defaultOgImage);

    const previousTitle = document.title;
    document.title = title;

    const restorers = [
      upsertMeta("description", description),
      upsertTag({
        selector: 'link[rel="canonical"]',
        tagName: "link",
        identify: { rel: "canonical" },
        attr: "href",
        value: canonical,
      }),
      // Open Graph
      upsertMeta("og:title", title, true),
      upsertMeta("og:description", description, true),
      upsertMeta("og:type", type, true),
      upsertMeta("og:url", canonical, true),
      upsertMeta("og:image", ogImage, true),
      upsertMeta("og:site_name", siteConfig.name, true),
      upsertMeta("og:locale", siteConfig.locale, true),
      // Twitter
      upsertMeta("twitter:card", siteConfig.twitterCard),
      upsertMeta("twitter:title", title),
      upsertMeta("twitter:description", description),
      upsertMeta("twitter:image", ogImage),
      // Robots: index/follow by default, or an explicit directive per route.
      upsertMeta("robots", robots ?? "index, follow"),
    ];

    return () => {
      document.title = previousTitle;
      for (const restore of restorers) restore();
    };
  }, [title, description, path, image, type, robots]);
}
