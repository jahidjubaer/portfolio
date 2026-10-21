import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { cn } from "../../lib/cn";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { DOT_RADIUS, buildClusters, clusterDots } from "./problem-map";

const DOT_CLASS = {
  vjudge: "fill-(--color-text-muted)",
  merged: "fill-(--color-text-muted)",
  direct: "fill-(--color-text-primary)",
  both: "fill-(--color-accent-fill)",
  manual: "fill-(--color-accent-fill)",
};

const LEGEND = [
  { kind: "direct", label: "Codeforces account" },
  { kind: "both", label: "Both, counted once" },
  { kind: "vjudge", label: "Through VJudge" },
];

// The whole entrance stays under ~1.6 s however many dots there are.
const CLUSTER_STAGGER_MS = 90;
const DOTS_SPREAD_MS = 600;

function ClusterGraphic({ cluster, order, playing }) {
  const { width, height, dots } = clusterDots(cluster);
  const perDot = Math.min(8, DOTS_SPREAD_MS / dots.length);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="block"
    >
      {dots.map((dot) => (
        <circle
          key={dot.index}
          cx={dot.cx}
          cy={dot.cy}
          r={DOT_RADIUS}
          className={cn("problem-dot", DOT_CLASS[dot.kind])}
          style={
            playing
              ? {
                  animationDelay: `${order * CLUSTER_STAGGER_MS + dot.index * perDot}ms`,
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
}

/**
 * Every distinct solved problem as a dot, grouped by the judge it comes
 * from (largest first). Codeforces splits into account / both / VJudge
 * so the overlap is visibly counted once; Dimik OJ is highlighted. The
 * dots settle in once, the first time the map scrolls into view; the
 * prerendered page, reduced motion, and a map already on screen show
 * them at once. Names and counts are always written under each cluster,
 * and the per-judge table below stays the accessible source.
 * @param {{
 *   judges: import("../../data/coding").JudgeStats[],
 *   dimikSolved: number | null,
 *   total: number,
 * }} props
 */
export function ProblemMap({ judges, dimikSolved, total }) {
  const clusters = buildClusters(judges, dimikSolved);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  // Hidden only once JS knows the map is still below the fold, so the
  // prerendered dots never flash out.
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    const top = ref.current?.getBoundingClientRect().top ?? 0;
    if (top > window.innerHeight) setArmed(true);
  }, [reducedMotion]);

  const playing = armed && inView;
  const showsSplit = clusters.some((cluster) => cluster.segments.length > 1);

  return (
    <figure ref={ref} className="mt-4">
      <div
        aria-hidden="true"
        className={cn(
          "flex flex-wrap items-end gap-x-5 gap-y-4 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface-soft) p-4",
          "[&:has(.problem-cluster:hover)_.problem-cluster:not(:hover)]:opacity-45",
          armed && !inView && "problem-map-armed",
          playing && "problem-map-playing",
        )}
      >
        {clusters.map((cluster, order) => (
          <div
            key={cluster.key}
            className="problem-cluster grid gap-1.5 transition-opacity duration-(--duration-quick)"
          >
            <ClusterGraphic cluster={cluster} order={order} playing={playing} />
            <p className="text-xs leading-tight">
              <span
                className={cn(
                  "font-semibold",
                  cluster.highlight
                    ? "text-(--color-accent-primary)"
                    : "text-(--color-text-primary)",
                )}
              >
                {cluster.name}
              </span>{" "}
              <span className="font-mono text-(--color-text-secondary) tabular-nums">
                {cluster.total}
              </span>
              {cluster.note ? (
                <span className="block text-(--color-text-muted)">
                  {cluster.note}
                </span>
              ) : null}
            </p>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--color-text-muted)">
        <span>
          One dot per problem · {total} distinct
          {dimikSolved ? " (with Dimik OJ)" : ""}
        </span>
        {showsSplit
          ? LEGEND.map((entry) => (
              <span
                key={entry.kind}
                className="inline-flex items-center gap-1.5"
              >
                <svg width="10" height="10" aria-hidden="true">
                  <circle
                    cx="5"
                    cy="5"
                    r={DOT_RADIUS}
                    className={DOT_CLASS[entry.kind]}
                  />
                </svg>
                {entry.label}
              </span>
            ))
          : null}
      </figcaption>
    </figure>
  );
}
