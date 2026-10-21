import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AudioLines,
  BookOpen,
  Check,
  Palette,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { usePreferences } from "../../features/preferences/usePreferences";
import {
  ACCENT_OPTIONS,
  FONT_OPTIONS,
  PLAIN_THEMES,
  SCENE_OPTIONS,
  SEASON_AUTO,
  SEASON_OPTIONS,
  seasonOption,
} from "../../features/preferences/appearance-options";
import { seasonOn } from "../../features/preferences/seasons";
import { useNow } from "../../lib/hydration";
import { loadFont } from "../../features/preferences/font-loader";
import { replayOpening } from "../../features/intro/opening-state";
import { siteSettings } from "../../data/settings";

// The site's defaults (Site settings) are what "Reset" goes back to.
const { accent: SITE_ACCENT, font: SITE_FONT } = siteSettings.appearance;
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

// Graphite and Paper, then the scenes (docs/14 R7).
const THEME_CHOICES = [...PLAIN_THEMES, ...SCENE_OPTIONS];

/**
 * A theme as a small print of itself: its canvas, a surface card with a
 * line of text, and an accent dot. A native radio underneath. `caption`
 * replaces the visible label (the label stays the accessible name).
 * @param {{
 *   name: string,
 *   choice: { id: string, label: string, swatch: string[] },
 *   caption?: string,
 *   captionLang?: string,
 *   checked: boolean,
 *   onChange: (event: import("react").ChangeEvent<HTMLInputElement>) => void,
 * }} props
 */
function ThemePrint({ name, choice, caption, captionLang, checked, onChange }) {
  const [canvas, surface, accent, text] = choice.swatch;
  return (
    <label className="relative" title={caption ? choice.label : undefined}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="sr-only">{choice.label}</span>
      <span
        aria-hidden="true"
        className="flex cursor-pointer flex-col gap-1.5 rounded-(--radius-sm) border border-(--color-border) p-1.5 pb-1 transition-colors peer-checked:border-(--color-accent-primary) peer-checked:bg-(--color-accent-primary-soft) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--color-accent-primary) hover:border-(--color-border-strong)"
      >
        <span
          className="relative block h-9 overflow-hidden rounded-[5px] shadow-[inset_0_0_0_1px_rgb(127_127_127/0.25)]"
          style={{ background: canvas }}
        >
          <span
            className="absolute inset-x-1.5 bottom-1.5 top-3 rounded-[3px]"
            style={{ background: surface }}
          />
          <span
            className="absolute bottom-3 left-3 h-[3px] w-6 rounded-full"
            style={{ background: text }}
          />
          <span
            className="absolute right-2.5 top-1.5 size-2 rounded-full"
            style={{ background: accent }}
          />
        </span>
        <span
          lang={captionLang}
          className={cn(
            "text-center text-[0.75rem] font-medium leading-tight",
            checked
              ? "text-(--color-text-primary)"
              : "text-(--color-text-secondary)",
          )}
        >
          {caption ?? choice.label}
        </span>
      </span>
    </label>
  );
}

/**
 * "Customize" popover: theme (Graphite, Paper, or a scene), season
 * (today's, by the calendar, or a fixed one; docs/15), UI sounds,
 * accent color (plain themes only), and font. A
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
    scene,
    sceneChoice,
    chooseTheme,
    soundEnabled,
    toggleSound,
    ambienceEnabled,
    toggleAmbience,
    accent,
    setAccent,
    font,
    setFont,
    play,
  } = usePreferences();
  const accentLabel = ACCENT_OPTIONS.find(
    (option) => option.id === accent,
  )?.label;
  const selectedTheme = scene === "none" ? theme : scene;
  const shownSeason = seasonOption(scene);
  const themeLabel = shownSeason
    ? "Season"
    : THEME_CHOICES.find((choice) => choice.id === selectedTheme)?.label;
  const now = useNow();
  const todaysSeason = seasonOption(seasonOn(now));

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

  function handleReplayOpening() {
    setOpen(false);
    replayOpening();
  }

  function resetAppearance() {
    setAccent(SITE_ACCENT);
    setFont(SITE_FONT);
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
              "absolute z-(--z-overlay) max-h-[calc(100dvh-4.5rem)] w-72 overflow-y-auto rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-md)",
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
              <legend className={LEGEND}>
                Theme
                <span className="sr-only">:</span>{" "}
                <span className="text-(--color-text-secondary)">
                  {themeLabel}
                </span>
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {THEME_CHOICES.map((choice) => (
                  <ThemePrint
                    key={choice.id}
                    name={`${id}-theme`}
                    choice={choice}
                    checked={selectedTheme === choice.id}
                    onChange={(event) => chooseTheme(choice.id, event)}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-4">
              <legend className={LEGEND}>
                Season
                {shownSeason ? (
                  <>
                    <span className="sr-only">:</span>{" "}
                    <span className="text-(--color-text-secondary)">
                      {shownSeason.label}
                    </span>
                  </>
                ) : null}
              </legend>
              {/* "Today" follows the calendar; the six keep one season.
                  Shown by their Bangla names, read out in English. */}
              <div className="grid grid-cols-4 gap-2">
                <ThemePrint
                  name={`${id}-season`}
                  choice={{
                    id: SEASON_AUTO,
                    label: `This season (${todaysSeason.label})`,
                    swatch: todaysSeason.swatch,
                  }}
                  caption="Today"
                  checked={sceneChoice === SEASON_AUTO}
                  onChange={(event) => chooseTheme(SEASON_AUTO, event)}
                />
                {SEASON_OPTIONS.map((season) => (
                  <ThemePrint
                    key={season.id}
                    name={`${id}-season`}
                    choice={season}
                    caption={season.bangla}
                    captionLang="bn"
                    checked={sceneChoice === season.id}
                    onChange={(event) => chooseTheme(season.id, event)}
                  />
                ))}
              </div>
              {shownSeason ? (
                <button
                  type="button"
                  role="switch"
                  aria-checked={ambienceEnabled}
                  onClick={toggleAmbience}
                  className="mt-2 inline-flex min-h-11 w-full items-center gap-2 rounded-(--radius-sm) border border-(--color-border) px-3 text-sm font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary) aria-checked:border-(--color-accent-primary) aria-checked:text-(--color-text-primary)"
                >
                  <AudioLines
                    size={16}
                    aria-hidden="true"
                    className="text-(--color-accent-primary)"
                  />
                  {shownSeason.label} sounds
                  <span
                    aria-hidden="true"
                    className="ml-auto font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-(--color-text-muted)"
                  >
                    {ambienceEnabled ? "On" : "Off"}
                  </span>
                </button>
              ) : null}
            </fieldset>

            {scene === "none" ? (
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
            ) : null}

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

            {siteSettings.intro.enabled ? (
              <button
                type="button"
                onClick={handleReplayOpening}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-(--radius-sm) border border-(--color-border) text-sm font-medium text-(--color-text-secondary) transition-colors hover:border-(--color-border-strong) hover:text-(--color-text-primary)"
              >
                <BookOpen size={16} aria-hidden="true" />
                Play opening
              </button>
            ) : null}

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
                disabled={accent === SITE_ACCENT && font === SITE_FONT}
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
