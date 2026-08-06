import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

const NAV_LINK_CLASSES = ({ isActive }) =>
  `block rounded-lg px-4 py-3 text-lg font-medium ${
    isActive
      ? "text-(--color-accent)"
      : "text-(--color-text) hover:text-(--color-accent)"
  }`;

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

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    panelRef.current?.querySelector("a")?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      id={id}
      ref={panelRef}
      className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-(--color-border) bg-(--color-background) sm:hidden"
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
    </div>
  );
}
