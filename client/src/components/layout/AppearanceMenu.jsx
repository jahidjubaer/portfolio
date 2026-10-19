import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Moon, Palette, Sun, Volume2, VolumeX, X } from "lucide-react";
import { usePreferences } from "../../features/preferences/usePreferences";
import {
  ACCENT_OPTIONS,
  DEFAULT_ACCENT,
  DEFAULT_FONT,
  FONT_OPTIONS,
} from "../../features/preferences/appearance-options";
import { loadFont } from "../../features/preferences/font-loader";
import { ROUND_BUTTON } from "./PreferenceButtons";
import { cn } from "../../lib/cn";

const PANEL_PLACEMENT = {
  rail: "bottom-0 left-full ml-3 origin-bottom-left",
  header: "right-0 top-full mt-2 origin-top-right",
};

const LEGEND = "mono-meta mb-2.5 text-(--color-text-muted)";

const SEGMENT =
  "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-(--radius-sm) border border-(--color-border) text-sm font-medium text-(--color-text-secondary) transition-colors peer-checked:border-(--color-accent-primary) peer-checked:bg-(--color-accent-primary-soft) peer-checked:text-(--color-text-primary) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--color-accent-primary) hover:text-(--color-text-primary)";

/**
 * One native radio input styled as a tile. Native radios give arrow-key
 * movement inside the group and correct announcements for free.
 * @param {{ name: string, checked: boolean, onChange: () => void, className?: string, style?: import("react").CSSProperties, children: import("react").ReactNode }} props
 */
function RadioTile({ name, checked, onChange, className, style, children }) {
  return (
    <label className="relative">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className={cn(SEGMENT, className)} style={style}>
        {children}
      </span>
    </label>
  );
}

/**
 * "Customize" popover: theme, UI sounds, accent color, and font. A
 * disclosure (button + panel), not a modal — the page stays usable, and
 * Escape or a click outside closes it.
 * @param {{ placement?: "rail" | "header", className?: string }} props
 */
export function AppearanceMenu({ placement = "rail", className }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const id = useId();
  const panelId = `${id}-panel`;
  const {
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,
    accent,
    setAccent,
    font,
    setFont,
    play,
  } = usePreferences();
  const accentLabel = ACCENT_OPTIONS.find(
    (option) => option.id === accent,
  )?.label;

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleToggle() {
    if (!open) {
      // Load every typeface so the font list previews in its own faces.
      for (const option of FONT_OPTIONS) loadFont(option.id).catch(() => {});
    }
    setOpen(!open);
    play("tap");
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function resetAppearance() {
    setAccent(DEFAULT_ACCENT);
    setFont(DEFAULT_FONT);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Customize appearance"
        title="Customize"
        className={cn(
          ROUND_BUTTON,
          open && "border-(--color-accent-primary) text-(--color-text-primary)",
        )}
      >
        <Palette size={18} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            role="group"
            aria-labelledby={`${id}-title`}
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.16 }}
            className={cn(
              "absolute z-(--z-overlay) w-72 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-md)",
              PANEL_PLACEMENT[placement],
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <p
                id={`${id}-title`}
                className="font-semibold text-(--color-text-primary)"
              >
                Appearance
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Close appearance settings"
                className="-mr-2 inline-grid size-9 place-items-center rounded-full text-(--color-text-muted) hover:bg-(--color-surface-raised) hover:text-(--color-text-primary)"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <fieldset>
              <legend className={LEGEND}>Theme</legend>
              <div className="grid grid-cols-2 gap-2">
                <RadioTile
                  name={`${id}-theme`}
                  checked={theme === "dark"}
                  onChange={toggleTheme}
                >
                  <Moon size={15} aria-hidden="true" />
                  Dark
                </RadioTile>
                <RadioTile
                  name={`${id}-theme`}
                  checked={theme === "light"}
                  onChange={toggleTheme}
                >
                  <Sun size={15} aria-hidden="true" />
                  Light
                </RadioTile>
              </div>
            </fieldset>

            <fieldset className="mt-4">
              <legend className={LEGEND}>
                Accent
                <span className="sr-only">:</span>{" "}
                <span className="text-(--color-text-secondary)">
                  {accentLabel}
                </span>
              </legend>
              <div className="flex justify-between">
                {ACCENT_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    title={option.label}
                    className="relative"
                  >
                    <input
                      type="radio"
                      name={`${id}-accent`}
                      checked={accent === option.id}
                      onChange={() => setAccent(option.id)}
                      className="peer sr-only"
                    />
                    <span className="sr-only">{option.label}</span>
                    <span
                      aria-hidden="true"
                      className="grid size-11 cursor-pointer place-items-center rounded-full border-2 border-transparent transition-transform hover:scale-105 peer-checked:border-(--color-text-primary) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--color-accent-primary)"
                    >
                      <span
                        className="grid size-8 place-items-center rounded-full text-[#111] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
                        style={{ background: option.swatch }}
                      >
                        {accent === option.id ? (
                          <Check size={15} strokeWidth={3} />
                        ) : null}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-4">
              <legend className={LEGEND}>Font</legend>
              <div className="grid grid-cols-2 gap-2">
                {FONT_OPTIONS.map((option) => (
                  <RadioTile
                    key={option.id}
                    name={`${id}-font`}
                    checked={font === option.id}
                    onChange={() => setFont(option.id)}
                    style={{ fontFamily: option.family }}
                  >
                    {option.label}
                  </RadioTile>
                ))}
              </div>
            </fieldset>

            <div className="mt-4 flex items-center justify-between border-t border-(--color-border) pt-3">
              <button
                type="button"
                role="switch"
                aria-checked={soundEnabled}
                onClick={toggleSound}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-(--color-text-secondary) hover:text-(--color-text-primary)"
              >
                {soundEnabled ? (
                  <Volume2 size={16} aria-hidden="true" />
                ) : (
                  <VolumeX size={16} aria-hidden="true" />
                )}
                UI sounds
              </button>
              <button
                type="button"
                onClick={resetAppearance}
                disabled={accent === DEFAULT_ACCENT && font === DEFAULT_FONT}
                className="min-h-11 text-sm font-medium text-(--color-accent-primary) underline-offset-4 hover:underline disabled:cursor-default disabled:text-(--color-text-muted) disabled:no-underline"
              >
                Reset
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
