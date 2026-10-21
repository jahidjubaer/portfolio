import { useCallback, useEffect, useRef, useState } from "react";
import { Aperture } from "lucide-react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { FocusBrackets } from "../../components/ui/FocusBrackets";
import { LocalTime } from "../../components/ui/LocalTime";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
import { githubSnapshot } from "../../data/github";
import { usePreferences } from "../preferences/usePreferences";
import { HEADLINE_TECH } from "./headline-tech";
import { buildShutterItems, itemAt } from "./shutter-items";
import { ShutterPrint } from "./ShutterPrint";
import { BOKEH, INTRO_MS } from "./viewfinder";

const EASE = 0.12;
const RETICLE = 34;
// The blades close and open over SHOT_MS; the print appears as they open.
const SHOT_MS = 260;
const APERTURE_OPEN = 26;
const APERTURE_CAUGHT = 15;
const MAX_PRINTS = 3;

const SHUTTER_ITEMS = buildShutterItems({
  projects,
  tech: HEADLINE_TECH,
  bokeh: BOKEH,
});
const projectsBySlug = new Map(
  projects.map((project) => [project.slug, project]),
);

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
    accent: get("--color-accent-primary"),
    // Night shoot's bokeh glow (styles/scenes.css), in pixels of blur.
    glow: Number.parseFloat(get("--banner-glow")) || 0,
    light: document.documentElement.getAttribute("data-theme") === "light",
  };
}

function hexagon(ctx, x, y, r, turn = 0, begin = true) {
  if (begin) ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i + Math.PI / 6 + turn;
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
 * with a faint shutter flash.
 *
 * The shutter (docs/14 R6): some lights stand for a project or a
 * technology. With a mouse, the reticle follows the pointer and a
 * hexagonal aperture closes on the item it catches; a click, a tap, or the
 * Shoot button fires the shutter and a print of that item comes out of the
 * frame (the button goes through the items in order). Up to three prints
 * pile up beside the portrait, never over it; Escape or ✕ clears them.
 * Under reduced motion nothing moves: a shot just shows the print.
 *
 * The loop only runs while something moves, and stops when the tab is
 * hidden or the banner scrolls out of view, so an idle banner costs nothing.
 */
export function ProfileBanner() {
  const canvasRef = useRef(null);
  const reticleRef = useRef(null);
  const labelRef = useRef(null);
  const flashRef = useRef(null);
  const shootButtonRef = useRef(null);
  const bannerRef = useRef(null);
  // The canvas loop's controls, for shots fired from React (the button).
  const cameraRef = useRef(null);
  const shotTimers = useRef([]);
  const nextIndex = useRef(0);
  const printKey = useRef(0);
  const [prints, setPrints] = useState([]);
  const [announcement, setAnnouncement] = useState("");
  const { theme, scene, play } = usePreferences();
  const reduceMotion = useReducedMotion();

  const takeShot = useCallback(
    (item) => {
      play("shutter");
      cameraRef.current?.fire(item);
      if (!item) return;
      nextIndex.current =
        (SHUTTER_ITEMS.indexOf(item) + 1) % SHUTTER_ITEMS.length;
      const develop = () => {
        printKey.current += 1;
        const key = printKey.current;
        setPrints((current) =>
          [{ key, item }, ...current].slice(0, MAX_PRINTS),
        );
        setAnnouncement(`Took a shot of ${item.name}.`);
      };
      if (reduceMotion || !cameraRef.current) develop();
      else shotTimers.current.push(setTimeout(develop, SHOT_MS));
    },
    [play, reduceMotion],
  );

  // Clicks and taps on the banner reach React through the canvas loop,
  // which knows what the reticle caught; it calls the latest takeShot.
  const takeShotRef = useRef(takeShot);
  useEffect(() => {
    takeShotRef.current = takeShot;
  }, [takeShot]);

  useEffect(() => {
    const timers = shotTimers.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  function handleShootClick() {
    takeShot(SHUTTER_ITEMS[nextIndex.current]);
  }

  function clearPrints() {
    setPrints([]);
    setAnnouncement("Prints cleared.");
    shootButtonRef.current?.focus();
  }

  // Escape clears the prints while focus is in the banner (on the Shoot
  // button or a print), like closing any other overlay.
  const hasPrints = prints.length > 0;
  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner || !hasPrints) return undefined;
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      clearPrints();
    }
    banner.addEventListener("keydown", handleKeyDown);
    return () => banner.removeEventListener("keydown", handleKeyDown);
  }, [hasPrints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext?.("2d");
    if (!canvas || !ctx) return undefined;

    let width = 0;
    let height = 0;
    let colors = readColors();
    let frame = 0;
    let introRunning = false;
    let inView = true;
    let pointerInside = false;
    let caught = null;
    let shotStart = null;
    const focus = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0 };
    const aperture = { r: APERTURE_OPEN, target: APERTURE_OPEN };
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

    const reach = () => Math.max(width * 0.07, 34);
    const positionOf = (item) => ({ x: item.x * width, y: item.y * height });

    // The blades: everything outside a hexagonal hole that shrinks to
    // nothing and opens again, turning as it goes.
    function drawShutter(now) {
      const t = Math.min(1, (now - shotStart) / SHOT_MS);
      const closing = Math.sin(Math.PI * t);
      const hole = Math.hypot(width, height) * (1 - closing);
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      hexagon(ctx, focus.x, focus.y, hole, closing * 0.6, false);
      ctx.globalAlpha = 0.9 * closing;
      ctx.fillStyle = "#050505";
      ctx.fill("evenodd");
    }

    function draw(now = performance.now()) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, width, height);
      const blur = Math.max(width * 0.2, 120);
      const strength = colors.light ? 0.75 : 1;
      for (const [fx, fy, fr, tone] of BOKEH) {
        const x = fx * width;
        const y = fy * height;
        const dx = x - focus.x;
        const dy = y - focus.y;
        const sharp = Math.exp(-(dx * dx + dy * dy) / (blur * blur));
        // Out of focus: big, soft, faint. In focus: smaller, crisp rim.
        const r = fr * height * (1.35 - 0.6 * sharp);
        const color = colors.tones[tone];
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        hexagon(ctx, x, y, r);
        ctx.globalAlpha = (0.1 + 0.22 * sharp) * strength;
        if (colors.glow) {
          ctx.shadowColor = color;
          ctx.shadowBlur = colors.glow * (0.4 + sharp);
        }
        ctx.fill();
        ctx.lineWidth = 1 + 1.2 * sharp;
        ctx.globalAlpha = (0.18 + 0.72 * sharp) * strength;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      if (pointerInside) {
        // The aperture around the reticle, tightening (and turning) on a catch.
        const turn = (APERTURE_OPEN - aperture.r) / 20;
        hexagon(ctx, focus.x, focus.y, aperture.r, turn);
        ctx.globalAlpha = caught ? 0.95 : 0.5;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      if (shotStart !== null) drawShutter(now);

      const reticle = reticleRef.current;
      if (reticle) {
        reticle.style.transform = `translate(${focus.x - RETICLE / 2}px, ${
          focus.y - RETICLE / 2
        }px)`;
      }
      const label = labelRef.current;
      if (label) {
        label.style.opacity = pointerInside && caught ? "1" : "0";
        label.style.transform = `translate(${focus.x + RETICLE / 2 + 6}px, ${
          focus.y - 9
        }px)`;
      }
    }

    function step(now) {
      focus.x += (target.x - focus.x) * EASE;
      focus.y += (target.y - focus.y) * EASE;
      aperture.r += (aperture.target - aperture.r) * 0.2;
      if (shotStart !== null && now - shotStart >= SHOT_MS) shotStart = null;
      draw(now);
      const settled =
        Math.abs(target.x - focus.x) < 0.5 &&
        Math.abs(target.y - focus.y) < 0.5 &&
        Math.abs(aperture.target - aperture.r) < 0.3 &&
        shotStart === null;
      frame =
        settled || document.hidden || !inView ? 0 : requestAnimationFrame(step);
    }

    function wake() {
      if (!frame && !document.hidden && inView) {
        frame = requestAnimationFrame(step);
      }
    }

    function animateTo(x, y) {
      target.x = x;
      target.y = y;
      wake();
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

    // A catch snaps the reticle onto the item's light.
    function updateCatch() {
      const item = itemAt(SHUTTER_ITEMS, pointer, {
        width,
        height,
        reach: reach(),
      });
      if (item !== caught) {
        caught = item;
        if (labelRef.current) labelRef.current.textContent = item?.name ?? "";
        aperture.target = item ? APERTURE_CAUGHT : APERTURE_OPEN;
      }
      const at = caught ? positionOf(caught) : pointer;
      animateTo(at.x, at.y);
    }

    cameraRef.current = {
      fire(item) {
        if (reduceMotion) return;
        if (introRunning) {
          cancelAnimationFrame(frame);
          frame = 0;
          introRunning = false;
        }
        if (item) Object.assign(target, positionOf(item));
        shotStart = performance.now();
        shutterFlash();
        wake();
      },
    };

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
        if (!introRunning) return;
        const t = Math.min(1, (now - start) / INTRO_MS);
        const eased = 1 - (1 - t) ** 3;
        focus.x = from.x + (resting.x - from.x) * eased;
        focus.y = from.y + (resting.y - from.y) * eased;
        Object.assign(target, focus);
        draw(now);
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
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointerInside = true;
      updateCatch();
    }
    function handlePointerLeave() {
      pointerInside = false;
      caught = null;
      aperture.target = APERTURE_OPEN;
      if (!reduceMotion && !introRunning) animateTo(resting.x, resting.y);
    }
    // A click shoots what the reticle caught; a tap, the light under the
    // finger. Clicks on the banner's own controls and prints aren't shots.
    function handleClick(event) {
      if (event.target.closest?.("a, button, article")) return;
      if (pointerInside && !reduceMotion) {
        takeShotRef.current(caught);
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      const item = itemAt(SHUTTER_ITEMS, point, {
        width,
        height,
        reach: reach() * 1.5,
      });
      if (item) takeShotRef.current(item);
    }
    // A tab hidden mid-animation stops its loop; snap to rest on return.
    function handleVisibility() {
      if (document.hidden || frame) return;
      introRunning = false;
      shotStart = null;
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

    const host = bannerRef.current ?? canvas.parentElement;
    host.addEventListener("pointermove", handlePointerMove);
    host.addEventListener("pointerleave", handlePointerLeave);
    host.addEventListener("click", handleClick);
    document.addEventListener("visibilitychange", handleVisibility);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(handleResize);
    observer?.observe(canvas);
    // Off screen, nothing is drawn; back on screen, the loop resumes.
    const viewObserver =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            if (inView) {
              if (!introRunning) wake();
              return;
            }
            cancelAnimationFrame(frame);
            frame = 0;
            shotStart = null;
          });
    viewObserver?.observe(host);

    // Theme switches change the token colors; re-read and repaint.
    colors = readColors();
    draw();

    return () => {
      cancelAnimationFrame(frame);
      introRunning = false;
      cameraRef.current = null;
      host.removeEventListener("pointermove", handlePointerMove);
      host.removeEventListener("pointerleave", handlePointerLeave);
      host.removeEventListener("click", handleClick);
      document.removeEventListener("visibilitychange", handleVisibility);
      observer?.disconnect();
      viewObserver?.disconnect();
    };
  }, [theme, scene, reduceMotion]);

  // "250+ programming problems solved" → "250+".
  const solved = profile.problemSolving.total.split(" ")[0];
  const repos = githubSnapshot.publicRepos;
  const readout =
    "font-mono text-[0.625rem] uppercase tracking-[0.12em] text-(--color-text-secondary) sm:text-[0.6875rem]";

  return (
    <div
      ref={bannerRef}
      className="relative h-40 overflow-hidden border-b border-(--color-border) bg-(--color-canvas) sm:h-56 [@media(pointer:fine)]:cursor-crosshair"
    >
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
        {/* The caught item's name, beside the reticle (mouse only). */}
        <span
          ref={labelRef}
          data-shutter-label=""
          className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-xs bg-(--color-canvas)/85 px-1.5 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-(--color-text-primary) opacity-0 transition-opacity duration-150"
        />
        <div
          ref={flashRef}
          className="pointer-events-none absolute inset-0 bg-white opacity-0"
        />
        {/* Golden hour's soft vignette (styles/scenes.css); none elsewhere. */}
        <div className="pointer-events-none absolute inset-0 bg-(image:--scene-vignette)" />
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

      {SHUTTER_ITEMS.length > 0 ? (
        <button
          ref={shootButtonRef}
          type="button"
          onClick={handleShootClick}
          aria-label="Shoot a project or technology"
          className="absolute left-1/2 top-2 z-20 flex h-11 min-w-11 -translate-x-1/2 items-center justify-center gap-1.5 rounded-full px-3 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary) sm:top-3"
        >
          <span className="grid size-7 place-items-center rounded-full border border-(--color-border-strong) bg-(--color-canvas)/80 text-(--color-accent-primary)">
            <Aperture size={15} aria-hidden="true" />
          </span>
          <span aria-hidden="true" className="max-sm:hidden">
            Shoot
          </span>
        </button>
      ) : null}

      {/* Prints pile up beside the portrait: left on phones, right above. */}
      <div
        data-banner-prints=""
        className="absolute left-3 top-3 z-10 sm:left-auto sm:right-4 sm:top-4"
      >
        <AnimatePresence>
          {prints.map((print, depth) => (
            <ShutterPrint
              key={print.key}
              item={print.item}
              project={projectsBySlug.get(print.item.slug)}
              depth={depth}
              onClear={clearPrints}
            />
          ))}
        </AnimatePresence>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
