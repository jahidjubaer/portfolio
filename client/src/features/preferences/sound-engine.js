/**
 * Tiny UI sound palette synthesized with the Web Audio API — no audio
 * files to download. Every sound is a few short, quiet oscillator notes.
 * The AudioContext is created lazily on the first play, which always
 * happens inside a user gesture, so browsers' autoplay rules are met.
 */

/** @type {Record<string, Array<{ freq: number, at: number, dur: number, type?: OscillatorType }>>} */
const SOUNDS = {
  tap: [{ freq: 1650, at: 0, dur: 0.035, type: "sine" }],
  toggle: [
    { freq: 620, at: 0, dur: 0.05, type: "triangle" },
    { freq: 930, at: 0.055, dur: 0.06, type: "triangle" },
  ],
  message: [
    { freq: 740, at: 0, dur: 0.06, type: "sine" },
    { freq: 1110, at: 0.07, dur: 0.09, type: "sine" },
  ],
  success: [
    { freq: 880, at: 0, dur: 0.07, type: "sine" },
    { freq: 1320, at: 0.075, dur: 0.1, type: "sine" },
  ],
};

const PEAK_GAIN = 0.045;

let context = null;

function getContext() {
  if (context) return context;
  const AudioContextClass =
    typeof window !== "undefined" &&
    (window.AudioContext || window.webkitAudioContext);
  if (!AudioContextClass) return null;
  context = new AudioContextClass();
  return context;
}

/** @param {keyof typeof SOUNDS} name */
export function playSound(name) {
  const notes = SOUNDS[name];
  if (!notes) return;
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const start = ctx.currentTime;
  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = note.type ?? "sine";
    osc.frequency.setValueAtTime(note.freq, start + note.at);
    gain.gain.setValueAtTime(0, start + note.at);
    gain.gain.linearRampToValueAtTime(PEAK_GAIN, start + note.at + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + note.at + note.dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start + note.at);
    osc.stop(start + note.at + note.dur + 0.02);
  }
}
