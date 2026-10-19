import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { usePreferences } from "../preferences/usePreferences";

const CELL_W = 7;
const CELL_H = 15;
const GAP_X = 4;
const GAP_Y = 5;
const EASE = 0.12;
const INTRO_MS = 1100;

// Stable pseudo-random brightness jitter per cell, so redraws never flicker.
function cellNoise(col, row) {
  const n = Math.sin(col * 127.1 + row * 311.7) * 43758.5453;
  return n - Math.floor(n) - 0.5;
}

function readColors() {
  const styles = getComputedStyle(document.documentElement);
  const get = (name) => styles.getPropertyValue(name).trim();
  return {
    bg: get("--color-canvas"),
    hi: get("--color-banner-hi"),
    mid: get("--color-banner-mid"),
    lo: get("--color-banner-lo"),
    light: document.documentElement.getAttribute("data-theme") === "light",
  };
}

/**
 * The profile's dot-matrix "LED" banner: columns of rounded slats lit
 * brightest around a focal point. On load the light sweeps in from the
 * left; with a mouse, the focal point eases toward the pointer. Static
 * under reduced motion. The loop only runs while the light is moving and
 * stops when the tab is hidden, so an idle banner costs nothing.
 */
export function ProfileBanner() {
  const canvasRef = useRef(null);
  const { theme } = usePreferences();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext?.("2d");
    if (!canvas || !ctx) return undefined;

    let width = 0;
    let height = 0;
    let colors = readColors();
    let frame = 0;
    let introRunning = false;
    const focus = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let resting = { x: 0, y: 0 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      resting = { x: width / 2, y: height * 0.62 };
    }

    function draw() {
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, width, height);
      const cols = Math.ceil(width / (CELL_W + GAP_X));
      const rows = Math.ceil(height / (CELL_H + GAP_Y));
      const rx = width * 0.32;
      const ry = height * 0.75;
      const base = colors.light ? 0.14 : 0.2;
      for (let c = 0; c < cols; c += 1) {
        for (let r = 0; r < rows; r += 1) {
          const x = c * (CELL_W + GAP_X) + 2;
          const y = r * (CELL_H + GAP_Y) + 2;
          const dx = (x + CELL_W / 2 - focus.x) / rx;
          const dy = (y + CELL_H / 2 - focus.y) / ry;
          const glow = Math.exp(-(dx * dx + dy * dy));
          const alpha = base + glow * 0.8 + cellNoise(c, r) * 0.08;
          ctx.globalAlpha = Math.max(0.06, Math.min(1, alpha));
          if (glow > 0.55) ctx.fillStyle = colors.hi;
          else if (glow > 0.2) ctx.fillStyle = colors.mid;
          else ctx.fillStyle = colors.lo;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x, y, CELL_W, CELL_H, 3);
          else ctx.rect(x, y, CELL_W, CELL_H);
          ctx.fill();
        }
      }
    }

    function step() {
      focus.x += (target.x - focus.x) * EASE;
      focus.y += (target.y - focus.y) * EASE;
      draw();
      const settled =
        Math.abs(target.x - focus.x) < 0.5 &&
        Math.abs(target.y - focus.y) < 0.5;
      frame = settled || document.hidden ? 0 : requestAnimationFrame(step);
    }

    function animateTo(x, y) {
      target.x = x;
      target.y = y;
      if (!frame && !document.hidden) frame = requestAnimationFrame(step);
    }

    resize();
    if (reduceMotion) {
      Object.assign(focus, resting);
      draw();
    } else {
      // Intro: the light sweeps in from the left edge to its resting spot.
      Object.assign(focus, { x: -width * 0.2, y: resting.y });
      const start = performance.now();
      introRunning = true;
      const intro = (now) => {
        const t = Math.min(1, (now - start) / INTRO_MS);
        const eased = 1 - (1 - t) ** 3;
        focus.x = -width * 0.2 + (resting.x + width * 0.2) * eased;
        Object.assign(target, focus);
        draw();
        const done = t >= 1 || document.hidden;
        frame = done ? 0 : requestAnimationFrame(intro);
        if (done) introRunning = false;
      };
      frame = requestAnimationFrame(intro);
    }

    function handlePointerMove(event) {
      if (reduceMotion || introRunning || event.pointerType !== "mouse") {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      animateTo(event.clientX - rect.left, event.clientY - rect.top);
    }
    function handlePointerLeave() {
      if (!reduceMotion) animateTo(resting.x, resting.y);
    }
    // A tab hidden mid-animation stops its loop; snap to rest on return.
    function handleVisibility() {
      if (document.hidden || frame) return;
      introRunning = false;
      Object.assign(focus, resting);
      Object.assign(target, resting);
      draw();
    }
    function handleResize() {
      resize();
      Object.assign(focus, resting);
      Object.assign(target, resting);
      draw();
    }

    const host = canvas.parentElement;
    host.addEventListener("pointermove", handlePointerMove);
    host.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibility);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(handleResize);
    observer?.observe(canvas);

    // Theme switches change the token colors; re-read and repaint.
    colors = readColors();
    draw();

    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", handlePointerMove);
      host.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
      observer?.disconnect();
    };
  }, [theme, reduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="relative h-36 overflow-hidden border-b border-(--color-border) bg-(--color-canvas) sm:h-56"
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-(--color-canvas) to-transparent" />
    </div>
  );
}
