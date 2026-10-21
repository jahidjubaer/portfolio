import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { Check, Search, Share2, X } from "lucide-react";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { usePreferences } from "../../features/preferences/usePreferences";
import { shareProfile } from "../../features/profile/share-profile";
import { DURATIONS, EASE_STANDARD } from "../../features/motion/motion-config";
import { cn } from "../../lib/cn";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const ROW =
  "flex min-h-12 w-full items-center gap-3.5 rounded-(--radius-md) px-3 text-[0.9375rem] font-medium transition-colors";

/**
 * Bottom sheet behind the phone bar's "More" tab: every page the bar has no
 * room for, plus search (the command palette) and sharing. A modal dialog:
 * focus moves in and stays in, Escape or the backdrop closes it, and focus
 * returns to the More tab.
 * @param {{
 *   items: Array<{ to: string, label: string, icon: import("react").ComponentType<any>, end?: boolean }>,
 *   onClose: () => void,
 *   triggerRef: import("react").RefObject<HTMLElement | null>,
 * }} props
 */
export function MoreSheet({ items, onClose, triggerRef }) {
  const { play } = usePreferences();
  const reduceMotion = useReducedMotion();
  const panelRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useBodyScrollLock(true);

  useEffect(() => {
    const trigger = triggerRef.current;
    panelRef.current?.querySelector(FOCUSABLE)?.focus();
    return () => trigger?.focus();
  }, [triggerRef]);

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE)];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleSearch() {
    onClose();
    // After focus has returned to the More tab, so the palette hands focus
    // back there (not to this sheet's detached button) when it closes.
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("open-command-palette"));
    }, 0);
  }

  async function handleShare() {
    if ((await shareProfile()) !== "copied") return;
    play("success");
    setCopied(true);
  }

  return (
    <div className="fixed inset-0 z-(--z-overlay) md:hidden">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-black/60"
        initial={{ opacity: reduceMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATIONS.quick }}
        onClick={onClose}
      />
      {/* Keydown here traps Tab and handles Escape for the modal sheet. */}
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="more-sheet-title"
        onKeyDown={handleKeyDown}
        initial={reduceMotion ? false : { y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: DURATIONS.standard, ease: EASE_STANDARD }}
        className="absolute inset-x-0 bottom-0 rounded-t-(--radius-lg) border-t border-(--color-border-strong) bg-(--color-surface-raised) px-3 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-(--shadow-md)"
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-2 h-1 w-10 rounded-full bg-(--color-border-strong)"
        />
        <div className="flex items-center justify-between px-3 pb-1">
          <h2
            id="more-sheet-title"
            className="text-sm font-semibold tracking-wide text-(--color-text-muted) uppercase"
          >
            More
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-11 place-items-center rounded-(--radius-md) text-(--color-text-muted) hover:text-(--color-text-primary)"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="More pages">
          <ul className="grid">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={() => {
                      play("tap");
                      onClose();
                    }}
                    className={({ isActive }) =>
                      cn(
                        ROW,
                        isActive
                          ? "bg-(--color-accent-primary-soft) text-(--color-accent-primary)"
                          : "text-(--color-text-primary) hover:bg-(--color-surface)",
                      )
                    }
                  >
                    <Icon size={20} aria-hidden="true" />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-2 grid border-t border-(--color-border) pt-2">
          <button
            type="button"
            onClick={handleSearch}
            className={cn(
              ROW,
              "text-(--color-text-primary) hover:bg-(--color-surface)",
            )}
          >
            <Search size={20} aria-hidden="true" />
            Search the site
          </button>
          <button
            type="button"
            onClick={handleShare}
            className={cn(
              ROW,
              "text-(--color-text-primary) hover:bg-(--color-surface)",
            )}
          >
            {copied ? (
              <Check
                size={20}
                aria-hidden="true"
                className="text-(--color-accent-primary)"
              />
            ) : (
              <Share2 size={20} aria-hidden="true" />
            )}
            Share profile
          </button>
          <span role="status" className="sr-only">
            {copied ? "Profile link copied" : ""}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
