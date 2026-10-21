import { LIGHTNING_EVENT } from "./season-events";

/**
 * Each season's ambience (docs/15 S2), synthesized with Web Audio like
 * the UI sounds in features/preferences/sound-engine.js: no files to
 * download. Every sound is filtered noise or a few short oscillator
 * notes, scheduled a little at a time while it plays:
 *
 * - Grishma: a warm wind, and far thunder after each lightning flash.
 * - Barsha: steady rain and drops ticking on a tin roof.
 * - Sharat: a light breeze.
 * - Hemanta: crickets in the evening and a little wind.
 * - Sheet: a cold wind rising and falling.
 * - Basanta: birdsong and now and then a koel.
 *
 * Only ever started by the visitor turning the ambience on. If that was
 * on a past visit, browsers hold the sound until the first tap or key
 * press, so it waits for one. Suspended while the tab is hidden.
 */

const MASTER = 0.5;
const FADE_IN = 1.6;
const FADE_OUT = 0.6;

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
  // Brown-ish: each sample leans on the last, so it rumbles, not hisses.
  let last = 0;
  for (let index = 0; index < data.length; index += 1) {
    last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04;
    data[index] = last * 3.5 + (Math.random() * 2 - 1) * 0.25;
  }
  return buffer;
}

/**
 * Looping noise through a filter into `out`.
 * @param {AudioContext} ctx
 * @param {AudioNode} out
 * @param {{ type: BiquadFilterType, frequency: number, q?: number, gain: number }} options
 */
function noiseBed(ctx, out, { type, frequency, q = 0.7, gain }) {
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx, 3);
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = q;
  const level = ctx.createGain();
  level.gain.value = gain;
  source.connect(filter).connect(level).connect(out);
  source.start();
  return { source, filter, level };
}

/**
 * Wind: noise whose pitch and loudness drift with two slow LFOs.
 * @param {AudioContext} ctx
 * @param {AudioNode} out
 * @param {{ frequency: number, gain: number, rate: number }} options
 */
function wind(ctx, out, { frequency, gain, rate }) {
  const bed = noiseBed(ctx, out, { type: "bandpass", frequency, q: 0.9, gain });
  const sources = [bed.source];
  for (const [param, depth, speed] of [
    [bed.filter.frequency, frequency * 0.6, rate],
    [bed.level.gain, gain * 0.7, rate * 0.63],
  ]) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = speed;
    const amount = ctx.createGain();
    amount.gain.value = depth;
    lfo.connect(amount).connect(param);
    lfo.start();
    sources.push(lfo);
  }
  return sources;
}

/**
 * One short note gliding from `from` to `to` Hz.
 * @param {AudioContext} ctx
 * @param {AudioNode} out
 * @param {{ at: number, from: number, to: number, dur: number, gain: number, type?: OscillatorType }} note
 */
function chirp(ctx, out, { at, from, to, dur, gain, type = "sine" }) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(to, at + dur);
  const level = ctx.createGain();
  level.gain.setValueAtTime(0.0001, at);
  level.gain.exponentialRampToValueAtTime(gain, at + Math.min(0.02, dur / 3));
  level.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(level).connect(out);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

/** A drop on a tin roof: a bright ping that dies at once. */
function drip(ctx, out, at) {
  const pitch = 2200 + Math.random() * 2600;
  chirp(ctx, out, {
    at,
    from: pitch,
    to: pitch * 0.82,
    dur: 0.05 + Math.random() * 0.05,
    gain: 0.02 + Math.random() * 0.03,
    type: "triangle",
  });
}

/** A small bird: two to five quick upward chirps. */
function birdCall(ctx, out, at) {
  const base = 2600 + Math.random() * 1800;
  const notes = 2 + Math.floor(Math.random() * 4);
  for (let note = 0; note < notes; note += 1) {
    chirp(ctx, out, {
      at: at + note * 0.11,
      from: base,
      to: base * (1.25 + Math.random() * 0.3),
      dur: 0.07,
      gain: 0.035,
    });
  }
}

/** The koel's "ku-oo", rising, twice. */
function koel(ctx, out, at) {
  for (let call = 0; call < 2; call += 1) {
    const start = at + call * 0.9;
    const lift = 1 + call * 0.08;
    chirp(ctx, out, {
      at: start,
      from: 760 * lift,
      to: 780 * lift,
      dur: 0.18,
      gain: 0.05,
    });
    chirp(ctx, out, {
      at: start + 0.22,
      from: 820 * lift,
      to: 1100 * lift,
      dur: 0.38,
      gain: 0.05,
    });
  }
}

/** A cricket: a short train of high pulses. */
function cricket(ctx, out, at) {
  const pitch = 4300 + Math.random() * 500;
  for (let pulse = 0; pulse < 4; pulse += 1) {
    chirp(ctx, out, {
      at: at + pulse * 0.045,
      from: pitch,
      to: pitch,
      dur: 0.03,
      gain: 0.012,
      type: "square",
    });
  }
}

/** Far thunder: a low rumble swelling and rolling away. */
function thunder(ctx, out) {
  const at = ctx.currentTime + 0.8 + Math.random() * 1.5;
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx, 4);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 140;
  const level = ctx.createGain();
  level.gain.setValueAtTime(0.0001, at);
  level.gain.exponentialRampToValueAtTime(0.5, at + 0.35);
  level.gain.exponentialRampToValueAtTime(0.12, at + 1.4);
  level.gain.exponentialRampToValueAtTime(0.0001, at + 3.8);
  source.connect(filter).connect(level).connect(out);
  source.start(at);
  source.stop(at + 4);
}

/**
 * Per season: the steady beds, and `events`, each called every `every`
 * seconds (give or take half) to schedule a sound at a time.
 * @type {Record<string, { beds: (ctx: AudioContext, out: AudioNode) => AudioScheduledSourceNode[], events?: Array<{ every: number, play: (ctx: AudioContext, out: AudioNode, at: number) => void }> }>}
 */
const SEASONS = {
  grishma: {
    beds: (ctx, out) =>
      wind(ctx, out, { frequency: 420, gain: 0.18, rate: 0.07 }),
  },
  barsha: {
    beds: (ctx, out) => [
      noiseBed(ctx, out, { type: "lowpass", frequency: 2400, gain: 0.32 })
        .source,
      noiseBed(ctx, out, { type: "highpass", frequency: 3500, gain: 0.05 })
        .source,
    ],
    events: [{ every: 0.09, play: drip }],
  },
  sharat: {
    beds: (ctx, out) =>
      wind(ctx, out, { frequency: 900, gain: 0.08, rate: 0.05 }),
    events: [{ every: 7, play: birdCall }],
  },
  hemanta: {
    beds: (ctx, out) =>
      wind(ctx, out, { frequency: 500, gain: 0.07, rate: 0.04 }),
    events: [{ every: 0.7, play: cricket }],
  },
  sheet: {
    beds: (ctx, out) =>
      wind(ctx, out, { frequency: 650, gain: 0.22, rate: 0.09 }),
  },
  basanta: {
    beds: (ctx, out) =>
      wind(ctx, out, { frequency: 1100, gain: 0.04, rate: 0.05 }),
    events: [
      { every: 2.2, play: birdCall },
      { every: 14, play: koel },
    ],
  },
};

const LOOKAHEAD = 0.25;

/**
 * Starts the season's ambience; returns a function that fades it out and
 * stops everything it started.
 * @param {string} season
 * @returns {() => void}
 */
export function startAmbience(season) {
  const recipe = SEASONS[season];
  const ctx = getContext();
  if (!recipe || !ctx) return () => {};

  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  let started = false;
  let sources = [];
  let timer = 0;
  const next = (recipe.events ?? []).map(() => 0);

  // Keep scheduling a little ahead of the clock.
  function schedule() {
    const horizon = ctx.currentTime + LOOKAHEAD;
    recipe.events?.forEach((event, index) => {
      if (!next[index])
        next[index] = ctx.currentTime + Math.random() * event.every;
      while (next[index] < horizon) {
        event.play(ctx, master, next[index]);
        next[index] += event.every * (0.5 + Math.random());
      }
    });
  }

  function begin() {
    if (started || ctx.state !== "running") return;
    started = true;
    sources = recipe.beds(ctx, master);
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(MASTER, ctx.currentTime + FADE_IN);
    schedule();
    timer = window.setInterval(schedule, 100);
  }

  function unlock() {
    ctx.resume().then(begin, () => {});
  }

  function handleVisibility() {
    if (document.hidden) ctx.suspend().catch(() => {});
    else unlock();
  }

  function handleLightning() {
    if (started) thunder(ctx, master);
  }

  unlock();
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  document.addEventListener("visibilitychange", handleVisibility);
  if (season === "grishma")
    window.addEventListener(LIGHTNING_EVENT, handleLightning);

  return function stop() {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener(LIGHTNING_EVENT, handleLightning);
    window.clearInterval(timer);
    const end = ctx.currentTime + FADE_OUT;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, end);
    for (const source of sources) {
      try {
        source.stop(end);
      } catch {
        // Already stopped.
      }
    }
    window.setTimeout(() => master.disconnect(), FADE_OUT * 1000 + 100);
  };
}
