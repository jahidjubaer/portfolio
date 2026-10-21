import { useEffect, useRef } from "react";
import { createWeather, drawWeather, stepWeather } from "./weather";
import { LIGHTNING_EVENT } from "./season-events";

function readColors() {
  const root = document.documentElement;
  return {
    light: root.getAttribute("data-theme") === "light",
    accent: getComputedStyle(root)
      .getPropertyValue("--color-accent-primary")
      .trim(),
  };
}

/**
 * The season's weather (docs/15 S2) over the top two thirds of the
 * window: snow, rain, kash, husks, petals, or summer dust and far
 * lightning. Decoration only: click-through, hidden from assistive tech,
 * fading out toward its lower edge. SeasonLayer mounts it only while a
 * season is on and motion isn't reduced. The loop stops while the tab is
 * hidden. A lightning flash dispatches LIGHTNING_EVENT, so the ambience
 * can answer with thunder.
 * @param {{ season: string }} props
 */
export function SeasonWeather({ season }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext?.("2d");
    if (!canvas || !ctx) return undefined;

    let weather = null;
    let colors = readColors();
    let frame = 0;
    let last = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      weather = createWeather(season, width, height);
      colors = readColors();
    }

    function tick(now) {
      // In 60 fps frames, capped so a long pause doesn't jump.
      const dt = last ? Math.min((now - last) / (1000 / 60), 3) : 1;
      last = now;
      if (stepWeather(weather, dt)) {
        window.dispatchEvent(new Event(LIGHTNING_EVENT));
      }
      drawWeather(ctx, weather, colors);
      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (frame || document.hidden) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    }

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
    }

    function handleVisibility() {
      if (document.hidden) stop();
      else start();
    }

    resize();
    start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [season]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-season-weather={season}
      className="pointer-events-none fixed inset-x-0 top-0 z-(--z-weather) h-[66vh] w-full [mask-image:linear-gradient(to_bottom,black_55%,transparent)] print:hidden"
    />
  );
}
