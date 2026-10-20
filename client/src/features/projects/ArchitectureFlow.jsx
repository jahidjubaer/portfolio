import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import { cn } from "../../lib/cn";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  firstAppearances,
  layoutArchitecture,
} from "./architecture-layout";

// Share of a step's scroll distance spent drawing its line; the rest
// holds the finished step so it can be read.
const DRAW_SHARE = 0.7;

function stepText(edge) {
  return `${edge.from.label} → ${edge.to.label}: ${edge.step.label}`;
}

function StepBadge({ edge }) {
  return (
    <>
      <circle
        cx={edge.badge.x}
        cy={edge.badge.y}
        r="11"
        className="fill-(--color-accent-fill)"
      />
      <text
        x={edge.badge.x}
        y={edge.badge.y}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-(--color-on-accent-primary) font-mono text-[11px] font-semibold"
      >
        {edge.index + 1}
      </text>
    </>
  );
}

function StaticEdge({ edge }) {
  return (
    <g>
      <path
        d={edge.path}
        fill="none"
        strokeWidth="1.5"
        className="stroke-(--color-text-muted)"
      />
      <polygon points={edge.arrow} className="fill-(--color-text-muted)" />
      <StepBadge edge={edge} />
    </g>
  );
}

function AnimatedEdge({ edge, progress, count, activeIndex, drawn }) {
  const active = edge.index === activeIndex;
  const pathLength = useTransform(
    progress,
    [edge.index / count, (edge.index + DRAW_SHARE) / count],
    [0, 1],
  );
  const colour = active
    ? "stroke-(--color-accent-primary)"
    : "stroke-(--color-text-muted)";

  return (
    <g>
      <motion.path
        d={edge.path}
        fill="none"
        strokeWidth={active ? 2.5 : 1.5}
        className={cn(colour, edge.index > activeIndex ? "opacity-0" : null)}
        style={{ pathLength }}
      />
      <g
        className={cn(
          "transition-opacity duration-(--duration-quick)",
          drawn ? "opacity-100" : "opacity-0",
        )}
      >
        <polygon
          points={edge.arrow}
          className={
            active
              ? "fill-(--color-accent-primary)"
              : "fill-(--color-text-muted)"
          }
        />
        <StepBadge edge={edge} />
      </g>
    </g>
  );
}

function nodeBoxStyle(node, layout) {
  return {
    left: `${((node.x - NODE_WIDTH / 2) / layout.width) * 100}%`,
    top: `${((node.y - NODE_HEIGHT / 2) / layout.height) * 100}%`,
    width: `${(NODE_WIDTH / layout.width) * 100}%`,
    height: `${(NODE_HEIGHT / layout.height) * 100}%`,
  };
}

const NODE_CLASS =
  "absolute grid place-items-center rounded-(--radius-md) border bg-(--color-surface-raised) px-1.5 text-center text-[0.6875rem] font-semibold leading-tight text-(--color-text-primary) sm:text-[0.8125rem]";

function AnimatedNode({ node, layout, shown, lit }) {
  return (
    <div
      className={cn(
        NODE_CLASS,
        "transition-[opacity,translate,border-color,box-shadow] duration-(--duration-standard) ease-(--ease-standard)",
        shown ? "opacity-100" : "translate-y-2 opacity-0",
        lit
          ? "border-(--color-accent-primary) shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-accent-primary)_18%,transparent)]"
          : "border-(--color-border)",
      )}
      style={nodeBoxStyle(node, layout)}
    >
      {node.label}
    </div>
  );
}

function DiagramFrame({ layout, children, nodes, className, style }) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative mx-auto w-full", className)}
      style={{ aspectRatio: `${layout.width} / ${layout.height}`, ...style }}
    >
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        {children}
      </svg>
      {nodes}
    </div>
  );
}

/**
 * Every step at once: the diagram fully drawn, then the steps as a
 * numbered list (the numbers match the badges on the lines).
 */
function StaticFlow({ layout }) {
  return (
    <div>
      <DiagramFrame
        layout={layout}
        nodes={layout.nodes.map((node) => (
          <div
            key={node.id}
            className={cn(NODE_CLASS, "border-(--color-border)")}
            style={nodeBoxStyle(node, layout)}
          >
            {node.label}
          </div>
        ))}
      >
        {layout.edges.map((edge) => (
          <StaticEdge key={edge.index} edge={edge} />
        ))}
      </DiagramFrame>
      <ol className="mt-6 grid gap-3">
        {layout.edges.map((edge) => (
          <li key={edge.index} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-(--color-accent-fill) font-mono text-xs font-semibold text-(--color-on-accent-primary)"
            >
              {edge.index + 1}
            </span>
            <p className="body-sm text-(--color-text-secondary)">
              <span className="font-semibold text-(--color-text-primary)">
                {edge.from.label} → {edge.to.label}
              </span>{" "}
              — {edge.step.label}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * The diagram builds as the reader scrolls: a sticky panel holds it
 * while each step's line draws in, and the step's text shows below.
 * The numbered buttons jump to a step.
 */
function ScrollFlow({ layout, architecture }) {
  const scrollRef = useRef(null);
  const count = layout.edges.length;
  // The step being read, and how many lines have finished drawing. Only
  // the line drawing is tied to the scroll position frame by frame; parts,
  // arrows, and numbers switch on these and fade with CSS.
  const [active, setActive] = useState(0);
  const [drawnCount, setDrawnCount] = useState(0);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });
  const appearances = firstAppearances(architecture);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const position = value * count;
    setActive(Math.min(count - 1, Math.max(0, Math.floor(position))));
    setDrawnCount(
      Math.min(count, Math.max(0, Math.floor(position + 1 - DRAW_SHARE))),
    );
  });

  function isShown(node) {
    const appearance = appearances.get(node.id);
    if (!appearance) return true;
    return appearance.asSource
      ? appearance.step <= active
      : appearance.step < drawnCount;
  }

  function goToStep(index) {
    const element = scrollRef.current;
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: top + distance * ((index + 0.8) / count),
      behavior: "smooth",
    });
  }

  const current = layout.edges[active];

  return (
    <div
      ref={scrollRef}
      className="relative"
      style={{
        height: `calc(${count * 45}vh + 100dvh - var(--header-height))`,
      }}
    >
      <div className="sticky top-(--header-height) flex h-[calc(100dvh-var(--header-height))] flex-col justify-center gap-6 py-6">
        <DiagramFrame
          layout={layout}
          style={{
            maxWidth: `calc((100dvh - var(--header-height) - 14rem) * ${layout.width / layout.height})`,
          }}
          nodes={layout.nodes.map((node) => (
            <AnimatedNode
              key={node.id}
              node={node}
              layout={layout}
              shown={isShown(node)}
              lit={current.from.id === node.id || current.to.id === node.id}
            />
          ))}
        >
          {layout.edges.map((edge) => (
            <AnimatedEdge
              key={edge.index}
              edge={edge}
              progress={scrollYProgress}
              count={count}
              activeIndex={active}
              drawn={edge.index < drawnCount}
            />
          ))}
        </DiagramFrame>

        <div className="min-h-[4.5rem]">
          <p className="mono-meta text-(--color-text-muted)">
            Step {active + 1} of {count}
          </p>
          <p className="body-md mt-1 text-(--color-text-secondary)">
            <span className="font-semibold text-(--color-text-primary)">
              {current.from.label} → {current.to.label}
            </span>{" "}
            — {current.step.label}
          </p>
        </div>

        <ol className="flex flex-wrap gap-1.5" aria-label="Architecture steps">
          {layout.edges.map((edge) => (
            <li key={edge.index}>
              <button
                type="button"
                onClick={() => goToStep(edge.index)}
                aria-current={edge.index === active ? "step" : undefined}
                aria-label={`Step ${edge.index + 1}: ${stepText(edge)}`}
                className={cn(
                  "grid size-11 place-items-center rounded-full border font-mono text-sm font-semibold transition-colors",
                  edge.index === active
                    ? "border-transparent bg-(--color-accent-fill) text-(--color-on-accent-primary)"
                    : "border-(--color-border) text-(--color-text-secondary) hover:bg-(--color-surface-raised)",
                )}
              >
                {edge.index + 1}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/**
 * A case study's architecture as a diagram of its parts and the steps
 * between them. Wide screens with motion allowed get the scroll-built
 * version; phones, reduced motion, and the prerendered HTML get the
 * finished diagram with the steps listed.
 * @param {{ architecture: import("../../data/projects").Architecture }} props
 */
export function ArchitectureFlow({ architecture }) {
  const wide = useMediaQuery("(min-width: 64rem)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const layout = layoutArchitecture(architecture);

  if (wide && !reducedMotion) {
    return <ScrollFlow layout={layout} architecture={architecture} />;
  }
  return <StaticFlow layout={layout} />;
}
