import { useEffect, useState } from "react";

/**
 * True once the page has scrolled past `threshold` px. Used for the
 * header's subtle background treatment on scroll.
 * @param {number} threshold
 */
export function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > threshold,
  );

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > threshold);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
}
