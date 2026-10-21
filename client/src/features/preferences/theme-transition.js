import { flushSync } from "react-dom";

const DURATION_MS = 460;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const STEPS = 8;

/**
 * A hexagon (the opening of a six-bladed aperture) as a CSS polygon,
 * centred on (x, y), turned by `rotation` radians.
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {number} rotation
 */
export function hexagonPolygon(x, y, radius, rotation = 0) {
  const points = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = rotation + (Math.PI / 3) * i;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    points.push(`${px.toFixed(1)}px ${py.toFixed(1)}px`);
  }
  return `polygon(${points.join(", ")})`;
}

/** The centre of the control that asked for the switch. */
export function originOf(element) {
  const target = element?.closest?.("label") ?? element;
  const rect = target?.getBoundingClientRect?.();
  if (!rect || (rect.width === 0 && rect.height === 0)) {
    return { x: window.innerWidth - 40, y: 40 };
  }
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/**
 * Runs `update` (the React state change that flips the theme) so the new
 * theme opens out of `origin` as an aperture iris. Without View
 * Transitions, or with reduced motion, the switch is instant.
 * `data-theme-switch` on <html> scopes the CSS (view-transitions.css) so
 * route transitions keep their own cross-fade.
 * @param {{ x: number, y: number }} origin
 * @param {() => void} update
 */
export function switchThemeWithAperture(origin, update) {
  const reduceMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (typeof document.startViewTransition !== "function" || reduceMotion) {
    update();
    return;
  }

  const root = document.documentElement;
  root.setAttribute("data-theme-switch", "");
  const transition = document.startViewTransition(() => flushSync(update));

  transition.ready
    .then(() => {
      const { x, y } = origin;
      const reach = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      // A hexagon's flat sides sit at cos(30°) of its radius; open far
      // enough that those cover the farthest corner too.
      const radius = reach / Math.cos(Math.PI / 6);
      const frames = [];
      for (let step = 0; step <= STEPS; step += 1) {
        const t = step / STEPS;
        frames.push({
          clipPath: hexagonPolygon(x, y, radius * t, (Math.PI / 3) * t),
        });
      }
      root.animate(frames, {
        duration: DURATION_MS,
        easing: EASING,
        pseudoElement: "::view-transition-new(root)",
      });
    })
    .catch(() => {});

  transition.finished.finally(() => {
    root.removeAttribute("data-theme-switch");
  });
}
