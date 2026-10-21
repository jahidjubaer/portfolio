import { createContext } from "react";

/**
 * @typedef {{
 *   theme: "light" | "dark",
 *   toggleTheme: (event?: { currentTarget?: Element }) => void,
 *   scene: string,
 *   sceneChoice: string,
 *   chooseTheme: (id: string, event?: { currentTarget?: Element }) => void,
 *   soundEnabled: boolean,
 *   toggleSound: () => void,
 *   accent: string,
 *   setAccent: (id: string) => void,
 *   font: string,
 *   setFont: (id: string) => void,
 *   play: (name: "tap" | "toggle" | "message" | "success" | "pageOpen" | "shutter") => void,
 * }} Preferences
 */

const noop = () => {};

/**
 * Defaults apply only outside PreferencesProvider (a page rendered on its
 * own, e.g. in a unit test): dark theme, lime, Geist, silent, setters do nothing. The
 * app always mounts the provider in AppLayout.
 * @type {import("react").Context<Preferences>}
 */
export const PreferencesContext = createContext({
  theme: "dark",
  toggleTheme: noop,
  scene: "none",
  sceneChoice: "none",
  chooseTheme: noop,
  soundEnabled: false,
  toggleSound: noop,
  accent: "lime",
  setAccent: noop,
  font: "geist",
  setFont: noop,
  play: noop,
});
