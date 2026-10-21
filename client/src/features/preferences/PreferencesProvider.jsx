import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { PreferencesContext } from "./preferences-context";
import {
  ACCENT_STORAGE_KEY,
  FONT_STORAGE_KEY,
  SCENE_STORAGE_KEY,
  SOUND_STORAGE_KEY,
  THEME_STORAGE_KEY,
  getInitialAccent,
  getInitialFont,
  getInitialScene,
  getInitialSoundEnabled,
  followsSystemTheme,
  getInitialTheme,
  getPrerenderedPreferences,
  readPreference,
  writePreference,
} from "./preference-storage";
import { playSound } from "./sound-engine";
import { SEASON_AUTO, isSceneChoice, sceneOption } from "./appearance-options";
import { seasonOn } from "./seasons";
import { loadFont } from "./font-loader";
import { originOf, switchThemeWithAperture } from "./theme-transition";
import { useIsHydrating, useNow } from "../../lib/hydration";

const THEME_COLORS = { dark: "#09090b", light: "#ffffff" };

/**
 * Owns the visitor's appearance (theme, scene, accent, font) and UI-sound
 * preferences. Each is applied as a data attribute on <html> (`data-theme`,
 * `data-scene`, `data-accent`, `data-font`) that the stylesheets switch
 * on; index.html sets the same attributes before React loads so the first
 * paint is right. A scene (a full theme, docs/14 R7) brings its own base
 * theme and colours, so while one is on, `theme` is its base and the
 * visitor's accent waits (stored, not applied) until they pick Graphite
 * or Paper again. The "season" choice (docs/15) follows the calendar: it
 * shows today's season, resolved with useNow() so a prerendered page
 * hydrates with the build's season first.
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
          scene: getInitialScene(),
          soundEnabled: getInitialSoundEnabled(),
          accent: getInitialAccent(),
          font: getInitialFont(),
        },
  );
  const [plainTheme, setTheme] = useState(initial.theme);
  const [scene, setSceneState] = useState(initial.scene);
  const now = useNow();
  const activeScene = sceneOption(
    scene === SEASON_AUTO ? seasonOn(now) : scene,
  );
  const theme = activeScene ? activeScene.base : plainTheme;
  const [soundEnabled, setSoundEnabled] = useState(initial.soundEnabled);
  const [accent, setAccentState] = useState(initial.accent);
  const [font, setFontState] = useState(initial.font);

  useLayoutEffect(() => {
    setTheme(getInitialTheme());
    setSceneState(getInitialScene());
    setSoundEnabled(getInitialSoundEnabled());
    setAccentState(getInitialAccent());
    setFontState(getInitialFont());
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    if (activeScene) root.setAttribute("data-scene", activeScene.id);
    else root.removeAttribute("data-scene");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        activeScene ? activeScene.swatch[0] : THEME_COLORS[theme],
      );
  }, [theme, activeScene]);

  useLayoutEffect(() => {
    document.documentElement.setAttribute(
      "data-accent",
      activeScene ? "lime" : accent,
    );
  }, [accent, activeScene]);

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
  // control is where the new theme opens from. From a scene, the toggle
  // goes to the plain theme opposite the scene's base.
  const toggleTheme = useCallback(
    (event) => {
      const next = theme === "dark" ? "light" : "dark";
      writePreference(THEME_STORAGE_KEY, next);
      writePreference(SCENE_STORAGE_KEY, "none");
      switchThemeWithAperture(originOf(event?.currentTarget), () => {
        setTheme(next);
        setSceneState("none");
      });
      play("toggle");
    },
    [theme, play],
  );

  /**
   * Picks a plain theme ("dark" Graphite, "light" Paper), a scene or
   * season id, or "season" (follow the calendar).
   * @param {string} id
   * @param {{ currentTarget?: Element }} [event]
   */
  const chooseTheme = useCallback(
    (id, event) => {
      const nextScene = isSceneChoice(id) ? id : "none";
      const nextTheme = sceneOption(id)?.base ?? id;
      if (nextScene === "none") writePreference(THEME_STORAGE_KEY, nextTheme);
      writePreference(SCENE_STORAGE_KEY, nextScene);
      switchThemeWithAperture(originOf(event?.currentTarget), () => {
        if (nextScene === "none") setTheme(nextTheme);
        setSceneState(nextScene);
      });
      play("toggle");
    },
    [play],
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
        scene: activeScene ? activeScene.id : "none",
        sceneChoice: activeScene ? scene : "none",
        chooseTheme,
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
