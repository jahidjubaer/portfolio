import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { ButtonLink } from "../../components/ui/ButtonLink";

const SHOW_AFTER_PX = 400;
const HIDE_NEAR_BOTTOM_PX = 600;

/**
 * Route-specific floating contact action for case-study pages: appears
 * once the reader has committed to scrolling, and unmounts near the page
 * bottom so it never overlaps the pager or footer. Entrance styling is a
 * CSS transition gated by `motion-safe:`, so reduced-motion users simply
 * see it appear.
 */
export function StickyContactFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = null;

    function update() {
      frame = null;
      const scrolled = window.scrollY;
      const remaining =
        document.documentElement.scrollHeight - scrolled - window.innerHeight;
      setVisible(scrolled > SHOW_AFTER_PX && remaining > HIDE_NEAR_BOTTOM_PX);
    }

    function handleScroll() {
      if (frame === null) frame = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-(--z-header) -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 motion-safe:animate-[fab-enter_0.25s_ease-out]">
      <ButtonLink
        to="/contact"
        variant="primary"
        size="sm"
        leadingIcon={<Mail aria-hidden="true" size={15} />}
        className="shadow-lg"
      >
        Contact
      </ButtonLink>
    </div>
  );
}
