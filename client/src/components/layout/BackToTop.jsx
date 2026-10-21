import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { usePreferences } from "../../features/preferences/usePreferences";
import { cn } from "../../lib/cn";

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Round "Back to top" button for every page. It shows after a screen of
 * scrolling; its ring fills with how far down the page you are. Pressing it
 * scrolls up (instantly under reduced motion) and moves focus to the page's
 * H1, so keyboard and screen-reader users land at the top too.
 */
export function BackToTop() {
  const { play } = usePreferences();
  const [visible, setVisible] = useState(false);
  const ringRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      setVisible(window.scrollY > window.innerHeight);
      ringRef.current?.style.setProperty(
        "stroke-dashoffset",
        String(CIRCUMFERENCE * (1 - progress)),
      );
    }
    // Sit at the page column's right edge, so on wide screens the button
    // stays off the right rail's links.
    function place() {
      const column = document.getElementById("main-content");
      if (!column || !buttonRef.current) return;
      const inset = window.innerWidth >= 768 ? 24 : 16;
      const right = window.innerWidth - column.getBoundingClientRect().right;
      buttonRef.current.style.right = `${Math.max(right, 0) + inset}px`;
    }
    function handleScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    function handleResize() {
      place();
      handleScroll();
    }
    update();
    place();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function handleClick() {
    play("tap");
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
    const heading = document.querySelector("#main-content h1");
    if (heading) {
      if (!heading.hasAttribute("tabindex"))
        heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={visible ? undefined : "true"}
      className={cn(
        "fixed right-4 bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+0.75rem)] z-40 grid size-12 place-items-center rounded-full border border-(--color-border) bg-(--color-surface-raised)/95 text-(--color-text-primary) shadow-(--shadow-md) transition-[opacity,transform] duration-(--duration-standard) hover:text-(--color-accent-primary) active:scale-95 md:right-6 md:bottom-6",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          ref={ringRef}
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke="var(--color-accent-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}
