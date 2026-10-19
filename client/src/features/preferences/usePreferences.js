import { useContext } from "react";
import { PreferencesContext } from "./preferences-context";

/** @returns {import("./preferences-context").Preferences} */
export function usePreferences() {
  return useContext(PreferencesContext);
}
