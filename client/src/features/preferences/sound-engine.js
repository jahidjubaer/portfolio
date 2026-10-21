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

/** @param {AudioContext} ctx @param {number} seconds */
function noiseBuffer(ctx, seconds) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * The opening curtain: a short crackle of paper tearing, then a soft
 * whoosh as the halves swing away. Both are filtered white noise.
 * @param {AudioContext} ctx
 */
function playPageOpen(ctx) {
  const start = ctx.currentTime;

  const tear = ctx.createBufferSource();
  tear.buffer = noiseBuffer(ctx, 0.32);
  const tearFilter = ctx.createBiquadFilter();
  tearFilter.type = "highpass";
  tearFilter.frequency.value = 2600;
  const tearGain = ctx.createGain();
  // Uneven little bursts read as fibres giving way.
  for (let step = 0; step < 22; step += 1) {
    const at = start + step * 0.013;
    const level = (0.2 + Math.random() * 0.8) * 0.05 * (1 - step / 26);
    tearGain.gain.setValueAtTime(level, at);
  }
  tearGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
  tear.connect(tearFilter).connect(tearGain).connect(ctx.destination);
  tear.start(start);

  const whoosh = ctx.createBufferSource();
  whoosh.buffer = noiseBuffer(ctx, 1);
  const sweep = ctx.createBiquadFilter();
  sweep.type = "bandpass";
  sweep.Q.value = 0.9;
  sweep.frequency.setValueAtTime(420, start + 0.05);
  sweep.frequency.exponentialRampToValueAtTime(2100, start + 0.42);
  sweep.frequency.exponentialRampToValueAtTime(650, start + 0.95);
  const whooshGain = ctx.createGain();
  whooshGain.gain.setValueAtTime(0.0001, start + 0.05);
  whooshGain.gain.exponentialRampToValueAtTime(0.11, start + 0.38);
  whooshGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.98);
  whoosh.connect(sweep).connect(whooshGain).connect(ctx.destination);
  whoosh.start(start + 0.05);
  whoosh.stop(start + 1);
}

/**
 * The aperture opening: a camera shutter, two short clicks of band-passed
 * noise (the mirror flipping up, then the shutter closing behind it).
 * @param {AudioContext} ctx
 */
function playShutter(ctx) {
  const start = ctx.currentTime;
  for (const [offset, level, pitch] of [
    [0, 0.12, 3200],
    [0.075, 0.08, 2300],
  ]) {
    const click = ctx.createBufferSource();
    click.buffer = noiseBuffer(ctx, 0.05);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 1.4;
    filter.frequency.value = pitch;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, start + offset);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.045);
    click.connect(filter).connect(gain).connect(ctx.destination);
    click.start(start + offset);
    click.stop(start + offset + 0.05);
  }
}

const NOISE_SOUNDS = { pageOpen: playPageOpen, shutter: playShutter };

/** @param {keyof typeof SOUNDS | keyof typeof NOISE_SOUNDS} name */
export function playSound(name) {
  const notes = SOUNDS[name];
  const noise = NOISE_SOUNDS[name];
  if (!notes && !noise) return;
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  if (noise) {
    noise(ctx);
    return;
  }

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
