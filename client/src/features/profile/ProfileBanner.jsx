import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { FocusBrackets } from "../../components/ui/FocusBrackets";
import { LocalTime } from "../../components/ui/LocalTime";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
import { githubSnapshot } from "../../data/github";
import { usePreferences } from "../preferences/usePreferences";
import { BOKEH, INTRO_MS } from "./viewfinder";

const EASE = 0.12;
const RETICLE = 34;

function readColors() {
  const styles = getComputedStyle(document.documentElement);
  const get = (name) => styles.getPropertyValue(name).trim();
  return {
    bg: get("--color-canvas"),
    tones: [
      get("--color-banner-hi"),
      get("--color-banner-mid"),
      get("--color-banner-lo"),
    ],
    light: document.documentElement.getAttribute("data-theme") === "light",
  };
}

function hexagon(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i + Math.PI / 6;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/**
 * The profile's viewfinder: out-of-focus hexagonal "bokeh" lights (the
 * shape a six-bladed aperture gives them) behind a thirds grid, frame
 * corners, and a focus reticle. Lights near the focus point sharpen. On
 * load the focus travels in from the left and settles on the portrait
 * with a faint shutter flash; with a mouse, focus follows the pointer.
 * Static under reduced motion. The loop only runs while focus is moving
 * and stops when the tab is hidden, so an idle banner costs nothing.
 */
export function ProfileBanner() {
  const canvasRef = useRef(null);
  const reticleRef = useRef(null);
  const flashRef = useRef(null);
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
      // The portrait overlaps the banner's bottom edge, centred.
      resting = { x: width / 2, y: height - 26 };
    }

    function draw() {
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, width, height);
      const reach = Math.max(width * 0.2, 120);
      const strength = colors.light ? 0.75 : 1;
      for (const [fx, fy, fr, tone] of BOKEH) {
        const x = fx * width;
        const y = fy * height;
        const dx = x - focus.x;
        const dy = y - focus.y;
        const sharp = Math.exp(-(dx * dx + dy * dy) / (reach * reach));
        // Out of focus: big, soft, faint. In focus: smaller, crisp rim.
        const r = fr * height * (1.35 - 0.6 * sharp);
        const color = colors.tones[tone];
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        hexagon(ctx, x, y, r);
        ctx.globalAlpha = (0.1 + 0.22 * sharp) * strength;
        ctx.fill();
        ctx.lineWidth = 1 + 1.2 * sharp;
        ctx.globalAlpha = (0.18 + 0.72 * sharp) * strength;
        ctx.stroke();
      }
      const reticle = reticleRef.current;
      if (reticle) {
        reticle.style.transform = `translate(${focus.x - RETICLE / 2}px, ${
          focus.y - RETICLE / 2
        }px)`;
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

    function shutterFlash() {
      flashRef.current?.animate?.(
        [
          { opacity: 0 },
          { opacity: colors.light ? 0.5 : 0.22 },
          { opacity: 0 },
        ],
        { duration: 420, easing: "ease-out" },
      );
    }

    resize();
    if (reduceMotion) {
      Object.assign(focus, resting);
      Object.assign(target, resting);
      draw();
    } else {
      // Intro: focus travels in from the left and locks on the portrait.
      const from = { x: -width * 0.1, y: height * 0.35 };
      Object.assign(focus, from);
      const start = performance.now();
      introRunning = true;
      const intro = (now) => {
        const t = Math.min(1, (now - start) / INTRO_MS);
        const eased = 1 - (1 - t) ** 3;
        focus.x = from.x + (resting.x - from.x) * eased;
        focus.y = from.y + (resting.y - from.y) * eased;
        Object.assign(target, focus);
        draw();
        const done = t >= 1 || document.hidden;
        frame = done ? 0 : requestAnimationFrame(intro);
        if (done) {
          introRunning = false;
          if (t >= 1) shutterFlash();
        }
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
      if (!reduceMotion && !introRunning) animateTo(resting.x, resting.y);
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

  // "250+ programming problems solved" → "250+".
  const solved = profile.problemSolving.total.split(" ")[0];
  const repos = githubSnapshot.publicRepos;
  const readout =
    "font-mono text-[0.625rem] uppercase tracking-[0.12em] text-(--color-text-secondary) sm:text-[0.6875rem]";

  return (
    <div className="relative h-40 overflow-hidden border-b border-(--color-border) bg-(--color-canvas) sm:h-56">
      <div aria-hidden="true">
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
        {/* Rule-of-thirds grid. */}
        <div className="viewfinder-grid pointer-events-none absolute inset-0" />
        <div
          ref={reticleRef}
          className="pointer-events-none absolute left-0 top-0"
          style={{ width: RETICLE, height: RETICLE }}
        >
          <FocusBrackets locked className="inset-0!" />
          <span className="absolute left-1/2 top-1/2 size-1 -translate-1/2 rounded-full bg-(--color-accent-primary)" />
        </div>
        <div
          ref={flashRef}
          className="pointer-events-none absolute inset-0 bg-white opacity-0"
        />
        <FocusBrackets locked className="inset-3!" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-(--color-canvas) to-transparent" />
      </div>

      {/* Viewfinder readouts: real facts, readable by everyone. */}
      <div
        className={`${readout} absolute inset-x-6 top-5 flex justify-between gap-4`}
      >
        <span>
          <span className="text-(--color-accent-primary)" aria-hidden="true">
            ●{" "}
          </span>
          {profile.location.split(",")[0]}, BD
        </span>
        <span>
          <LocalTime className="tabular-nums" /> GMT+6
        </span>
      </div>
      <p
        className={`${readout} absolute inset-x-6 bottom-5 flex justify-between gap-4`}
      >
        <span>
          <span className="text-(--color-text-primary)">{solved}</span> solved
        </span>
        <span className="flex gap-3">
          <span>
            <span className="text-(--color-text-primary)">
              {projects.length}
            </span>{" "}
            projects
          </span>
          {typeof repos === "number" ? (
            <span className="max-sm:hidden">
              <span className="text-(--color-text-primary)">{repos}</span> repos
            </span>
          ) : null}
        </span>
      </p>
    </div>
  );
}
