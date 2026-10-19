export const OPENING_SEEN_KEY = "opening-seen";
export const REPLAY_EVENT = "portfolio:replay-opening";
// How long the closed sheet rests before it tears open.
export const HOLD_MS = 380;

/** Ask the opening curtain to play again (the "Play opening" button). */
export function replayOpening() {
  window.dispatchEvent(new Event(REPLAY_EVENT));
}
