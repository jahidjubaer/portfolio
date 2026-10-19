import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { usePreferences } from "../../features/preferences/usePreferences";
import { cn } from "../../lib/cn";

export const ROUND_BUTTON =
  "inline-grid size-11 place-items-center rounded-full border border-(--color-border) bg-(--color-surface-raised) text-(--color-text-secondary) transition-colors duration-(--duration-quick) hover:text-(--color-text-primary) hover:border-(--color-border-strong)";

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
