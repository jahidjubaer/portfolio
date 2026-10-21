export const OPEN_ASK_EVENT = "open-ask-jahid";

/** Opens the "Ask about Jahid" panel from anywhere (buttons, ⌘K). */
export function openAsk() {
  window.dispatchEvent(new CustomEvent(OPEN_ASK_EVENT));
}
