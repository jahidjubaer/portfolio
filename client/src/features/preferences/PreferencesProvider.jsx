import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { PreferencesContext } from "./preferences-context";
import {
  ACCENT_STORAGE_KEY,
  FONT_STORAGE_KEY,
  SOUND_STORAGE_KEY,
  THEME_STORAGE_KEY,
  getInitialAccent,
  getInitialFont,
  getInitialSoundEnabled,
  followsSystemTheme,
  getInitialTheme,
  getPrerenderedPreferences,
  readPreference,
  writePreference,
} from "./preference-storage";
import { playSound } from "./sound-engine";
import { loadFont } from "./font-loader";
import { originOf, switchThemeWithAperture } from "./theme-transition";
import { useIsHydrating } from "../../lib/hydration";

const THEME_COLORS = { dark: "#09090b", light: "#ffffff" };

/**
 * Owns the visitor's appearance (theme, accent, font) and UI-sound
 * preferences. Each is applied as a data attribute on <html> (`data-theme`,
 * `data-accent`, `data-font`) that the stylesheets switch on; index.html
 * sets the same attributes before React loads so the first paint is right.
 * @param {{ children: import("react").ReactNode }} props
 */
export function PreferencesProvider({ children }) {
  // While hydrating a prerendered page, start from what the server used;
  // the layout effect below then applies the stored choices before paint.
  const hydrating = useIsHydrating();
  const [initial] = useState(() =>
    hydrating
      ? getPrerenderedPreferences()
      : {
          theme: getInitialTheme(),
          soundEnabled: getInitialSoundEnabled(),
          accent: getInitialAccent(),
          font: getInitialFont(),
        },
  );
  const [theme, setTheme] = useState(initial.theme);
  const [soundEnabled, setSoundEnabled] = useState(initial.soundEnabled);
  const [accent, setAccentState] = useState(initial.accent);
  const [font, setFontState] = useState(initial.font);

  useLayoutEffect(() => {
    setTheme(getInitialTheme());
    setSoundEnabled(getInitialSoundEnabled());
    setAccentState(getInitialAccent());
    setFontState(getInitialFont());
  }, []);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", THEME_COLORS[theme]);
  }, [theme]);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
  }, [accent]);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-font", font);
    // A failed font download just leaves the system fallback in place.
    loadFont(font).catch(() => {});
  }, [font]);

  // With no explicit choice stored, keep following the OS setting live
  // (unless Site settings fix the default theme).
  useEffect(() => {
    if (!followsSystemTheme()) return undefined;
    const query = window.matchMedia?.("(prefers-color-scheme: light)");
    if (!query) return undefined;
    function handleChange(event) {
      if (readPreference(THEME_STORAGE_KEY)) return;
      setTheme(event.matches ? "light" : "dark");
    }
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  const play = useCallback(
    (name) => {
      if (soundEnabled) playSound(name);
    },
    [soundEnabled],
  );

  // Called from the toggle's click or a theme radio's change; the event's
  // control is where the new theme opens from.
  const toggleTheme = useCallback(
    (event) => {
      const next = theme === "dark" ? "light" : "dark";
      writePreference(THEME_STORAGE_KEY, next);
      switchThemeWithAperture(originOf(event?.currentTarget), () =>
        setTheme(next),
      );
      play("toggle");
    },
    [theme, play],
  );

  const toggleSound = useCallback(() => {
    const next = !soundEnabled;
    writePreference(SOUND_STORAGE_KEY, next ? "on" : "off");
    setSoundEnabled(next);
    // Confirm "sound on" audibly; muting stays silent.
    if (next) playSound("toggle");
  }, [soundEnabled]);

  const setAccent = useCallback(
    (id) => {
      writePreference(ACCENT_STORAGE_KEY, id);
      setAccentState(id);
      play("tap");
    },
    [play],
  );

  const setFont = useCallback(
    (id) => {
      writePreference(FONT_STORAGE_KEY, id);
      setFontState(id);
      play("tap");
    },
    [play],
  );

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        toggleTheme,
        soundEnabled,
        toggleSound,
        accent,
        setAccent,
        font,
        setFont,
        play,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}
