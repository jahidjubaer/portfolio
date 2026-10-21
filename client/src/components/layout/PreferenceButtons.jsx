import {
  CloudRain,
  Flower2,
  Moon,
  Snowflake,
  Sun,
  Volume2,
  VolumeX,
  Wheat,
  Wind,
} from "lucide-react";
import { usePreferences } from "../../features/preferences/usePreferences";
import { seasonOption } from "../../features/preferences/appearance-options";
import { cn } from "../../lib/cn";

export const ROUND_BUTTON =
  "inline-grid size-11 place-items-center rounded-full border border-(--color-border) bg-(--color-surface-raised) text-(--color-text-secondary) transition-[color,border-color,transform] duration-(--duration-quick) hover:text-(--color-text-primary) hover:border-(--color-border-strong) motion-safe:active:scale-95";

/** @param {{ className?: string }} props */
export function ThemeToggleButton({ className }) {
  const { theme, toggleTheme } = usePreferences();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(ROUND_BUTTON, className)}
    >
      {isDark ? (
        <Sun size={18} aria-hidden="true" />
      ) : (
        <Moon size={18} aria-hidden="true" />
      )}
    </button>
  );
}

/** @param {{ className?: string }} props */
export function SoundToggleButton({ className }) {
  const { soundEnabled, toggleSound } = usePreferences();
  return (
    <button
      type="button"
      onClick={toggleSound}
      aria-label={soundEnabled ? "Mute sounds" : "Turn sounds on"}
      aria-pressed={!soundEnabled}
      title={soundEnabled ? "Mute sounds" : "Turn sounds on"}
      className={cn(ROUND_BUTTON, className)}
    >
      {soundEnabled ? (
        <Volume2 size={18} aria-hidden="true" />
      ) : (
        <VolumeX size={18} aria-hidden="true" />
      )}
    </button>
  );
}

const SEASON_ICONS = {
  grishma: Sun,
  barsha: CloudRain,
  sharat: Wind,
  hemanta: Wheat,
  sheet: Snowflake,
  basanta: Flower2,
};

/**
 * Turns the season's ambience (docs/15 S2) on and off. Only there while
 * a season is on; lit in the accent while it plays.
 * @param {{ className?: string }} props
 */
export function AmbienceToggleButton({ className }) {
  const { scene, ambienceEnabled, toggleAmbience, play } = usePreferences();
  const season = seasonOption(scene);
  if (!season) return null;
  const Icon = SEASON_ICONS[season.id];
  const label = ambienceEnabled
    ? `Stop the ${season.label.toLowerCase()} sounds`
    : `Play the ${season.label.toLowerCase()} sounds`;

  function handleClick() {
    toggleAmbience();
    play("tap");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={ambienceEnabled}
      aria-label={label}
      title={label}
      className={cn(
        ROUND_BUTTON,
        ambienceEnabled &&
          "border-(--color-accent-primary) text-(--color-accent-primary) hover:text-(--color-accent-primary)",
        className,
      )}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}
