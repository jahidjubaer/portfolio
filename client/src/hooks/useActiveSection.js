import { useEffect, useState } from "react";

/**
 * Tracks which section ID is currently closest to the top of the viewport
 * (below a given offset). Uses a single IntersectionObserver.
 * @param {string[]} sectionIds
 * @param {number} offsetPx — distance from top to account for sticky header/nav
 * @returns {string | null} the active section ID
 */
export function useActiveSection(sectionIds, offsetPx = 80) {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;
    if (typeof IntersectionObserver === "undefined") return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: `-${offsetPx}px 0px -40% 0px`,
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sectionIds, offsetPx]);

  return activeId;
}
