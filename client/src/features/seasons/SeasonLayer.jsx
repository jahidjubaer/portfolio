import { lazy, Suspense } from "react";
import { useReducedMotion } from "motion/react";
import { usePreferences } from "../preferences/usePreferences";
import { seasonOption } from "../preferences/appearance-options";
import { useIsHydrating } from "../../lib/hydration";

const SeasonWeather = lazy(() =>
  import("./SeasonWeather").then((m) => ({ default: m.SeasonWeather })),
);

/**
 * Mounts the season's weather (docs/15 S2) while a season is on. Nothing
 * at all under reduced motion, in the prerendered HTML, or with a plain
 * theme or a photographic scene, and the weather code is fetched only
 * the first time it's needed.
 */
export function SeasonLayer() {
  const { scene } = usePreferences();
  const reduceMotion = useReducedMotion();
  const hydrating = useIsHydrating();
  const season = seasonOption(scene);
  if (hydrating || reduceMotion || !season) return null;
  return (
    <Suspense fallback={null}>
      <SeasonWeather key={season.id} season={season.id} />
    </Suspense>
  );
}
