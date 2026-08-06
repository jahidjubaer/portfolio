import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../lib/cn";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { mobileMenuVariants } from "../../features/motion/motion-variants";

const NAV_LINK_CLASSES = ({ isActive }) =>
  cn(
    "block rounded-(--radius-md) px-4 py-3 text-lg font-medium transition-colors",
    isActive
      ? "text-(--color-accent-primary)"
      : "text-(--color-text-primary) hover:text-(--color-accent-primary)",
  );

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

/**
 * @param {{
 *   id: string,
 *   open: boolean,
 *   onClose: () => void,
 *   navItems: Array<{ to: string, label: string }>,
 * }} props
 */
export function MobileMenu({ id, open, onClose, navItems }) {
  const panelRef = useRef(null);
  const { pathname } = useLocation();

  useBodyScrollLock(open);

  // Route change closes the menu — guards against opening the menu,
  // navigating via some other control, and leaving it stuck open.
  const previousPathnameRef = useRef(pathname);
  useEffect(() => {
    if (open && previousPathnameRef.current !== pathname) {
      onClose();
    }
    previousPathnameRef.current = pathname;
  }, [pathname, open, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    getFocusableElements(panelRef.current)[0]?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id={id}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          variants={mobileMenuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-x-0 top-(--header-height) bottom-0 z-(--z-mobile-menu) overflow-y-auto border-t border-(--color-border) bg-(--color-canvas) sm:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={NAV_LINK_CLASSES}
                onClick={onClose}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
