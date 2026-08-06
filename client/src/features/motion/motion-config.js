/**
 * Restrained timing scale shared by every Motion animation in the app.
 * Values are in seconds (Motion's native unit) and mirror the CSS
 * duration tokens in tokens.css so JS- and CSS-driven motion stay in
 * sync. Keep the hero entrance within `standard` so content never waits
 * long for access.
 */
export const DURATIONS = {
  instant: 0,
  quick: 0.16,
  standard: 0.28,
  slow: 0.46,
  cinematic: 0.9,
};

export const EASE_STANDARD = [0.22, 1, 0.36, 1];
export const EASE_OUT = [0, 0, 0.2, 1];
