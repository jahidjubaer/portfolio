import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Thin decorative reading-progress indicator pinned under the sticky
 * header on case-study routes. Fixed-position (no layout shift), updated
 * via requestAnimationFrame with a transform (no layout work), and not
 * rendered at all under prefers-reduced-motion — it is purely a motion
 * affordance, and scroll position itself already carries the information.
 */
export function ReadingProgressBar() {
  const barRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    let frame = null;

    function update() {
      frame = null;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const progress =
        scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
    }

    function handleScroll() {
      if (frame === null) frame = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-(--header-height) z-(--z-header) h-0.5"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-(--color-accent-primary)"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
