import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Search, ArrowUpRight, Download } from "lucide-react";
import { fadeVariants } from "../motion/motion-variants";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { cn } from "../../lib/cn";
import {
  getCommands,
  filterCommands,
  groupCommandsByCategory,
} from "./commands";

const ACTION_ICON = {
  navigate: null,
  external: ArrowUpRight,
  download: Download,
};

function executeCommand(command, { navigate, onClose }) {
  onClose();
  if (command.action.type === "navigate") {
    navigate(command.action.to);
    return;
  }
  if (command.action.type === "external") {
    window.open(command.action.href, "_blank", "noopener,noreferrer");
    return;
  }
  if (command.action.type === "download") {
    const link = document.createElement("a");
    link.href = command.action.href;
    link.download = command.action.filename;
    link.rel = "noopener";
    link.click();
  }
}

function CommandPalettePanel({ onClose, triggerRef }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const allCommands = useMemo(() => getCommands(), []);
  const filtered = useMemo(
    () => filterCommands(allCommands, query),
    [allCommands, query],
  );
  const grouped = useMemo(() => groupCommandsByCategory(filtered), [filtered]);

  useBodyScrollLock(true);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Query changed the result set — keep the highlight in range (and reset
  // to the top result, matching every other command palette).
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const triggerElement = triggerRef?.current;
    return () => {
      triggerElement?.focus();
    };
  }, [triggerRef]);

  const activeCommand = filtered[activeIndex] ?? null;
  const activeId = activeCommand
    ? `command-option-${activeCommand.id}`
    : undefined;

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    if (event.key === "Tab") {
      // A single focusable control (the search input) — nothing else to
      // tab to inside the palette, and Tab must never leak focus to
      // whatever the overlay is visually covering.
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        filtered.length === 0 ? 0 : Math.min(current + 1, filtered.length - 1),
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (activeCommand) executeCommand(activeCommand, { navigate, onClose });
    }
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <motion.div
      className="fixed inset-0 z-(--z-overlay) flex items-start justify-center bg-black/70 px-4 pt-[12vh]"
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onMouseDown={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={handleKeyDown}
        className="w-full max-w-xl overflow-hidden rounded-(--radius-lg) border border-(--color-border-strong) bg-(--color-surface-raised) shadow-(--shadow-md)"
      >
        <div className="flex items-center gap-3 border-b border-(--color-border) px-4 py-3">
          <Search
            aria-hidden="true"
            size={18}
            className="shrink-0 text-(--color-text-muted)"
          />
          <label htmlFor="command-palette-input" className="sr-only">
            Search commands
          </label>
          <input
            id="command-palette-input"
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-listbox"
            aria-activedescendant={activeId}
            autoComplete="off"
            placeholder="Type a command or search…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="body-sm w-full bg-transparent text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none"
          />
          <kbd className="mono-meta hidden shrink-0 rounded-(--radius-sm) border border-(--color-border) px-1.5 py-0.5 text-(--color-text-muted) sm:inline-block">
            Esc
          </kbd>
        </div>

        <p role="status" className="sr-only">
          {filtered.length} command{filtered.length === 1 ? "" : "s"} found
        </p>

        <ul
          id="command-palette-listbox"
          role="listbox"
          aria-label="Commands"
          className="max-h-[50vh] overflow-y-auto py-2"
        >
          {grouped.map((group) => (
            <li key={group.category}>
              <p className="mono-meta px-4 pb-1 pt-2 text-(--color-text-muted)">
                {group.category}
              </p>
              <ul>
                {group.commands.map((command) => {
                  const index = filtered.indexOf(command);
                  const isActive = index === activeIndex;
                  const Icon = ACTION_ICON[command.action.type];

                  return (
                    <li
                      key={command.id}
                      id={`command-option-${command.id}`}
                      role="option"
                      aria-selected={isActive}
                    >
                      <button
                        type="button"
                        tabIndex={-1}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() =>
                          executeCommand(command, { navigate, onClose })
                        }
                        className={cn(
                          "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                          isActive
                            ? "bg-(--color-accent-primary-soft) text-(--color-text-primary)"
                            : "text-(--color-text-secondary)",
                        )}
                      >
                        <span className={isActive ? "font-medium" : undefined}>
                          {command.label}
                        </span>
                        {Icon ? (
                          <Icon
                            aria-hidden="true"
                            size={14}
                            className="shrink-0 text-(--color-text-muted)"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}

          {filtered.length === 0 ? (
            <li className="body-sm px-4 py-6 text-center text-(--color-text-muted)">
              No matching commands.
            </li>
          ) : null}
        </ul>

        <div className="mono-meta hidden items-center gap-4 border-t border-(--color-border) px-4 py-2 text-(--color-text-muted) sm:flex">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * @param {{ open: boolean, onClose: () => void, triggerRef: import("react").RefObject<HTMLElement> }} props
 */
export function CommandPaletteDialog({ open, onClose, triggerRef }) {
  return (
    <AnimatePresence>
      {open ? (
        <CommandPalettePanel onClose={onClose} triggerRef={triggerRef} />
      ) : null}
    </AnimatePresence>
  );
}
