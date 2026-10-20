/*
 * Geometry for the architecture diagram, in SVG viewBox units. Parts sit
 * on a 3 × 3 grid; the diagram is cropped to the columns and rows in use.
 * Pure functions, so the prerendered and hydrated markup always match.
 */

const CELL_WIDTH = 200;
const CELL_HEIGHT = 140;
export const NODE_WIDTH = 150;
export const NODE_HEIGHT = 64;
const START_GAP = 6;
const END_GAP = 10;
// Two steps between the same parts in opposite directions curve apart.
const PAIR_BEND = 22;
const ARROW_LENGTH = 10;
const ARROW_HALF_WIDTH = 5;

function unit(dx, dy) {
  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length };
}

// Distance from a box's centre to its edge along a unit direction.
function distanceToEdge(direction) {
  const alongX = direction.x
    ? NODE_WIDTH / 2 / Math.abs(direction.x)
    : Infinity;
  const alongY = direction.y
    ? NODE_HEIGHT / 2 / Math.abs(direction.y)
    : Infinity;
  return Math.min(alongX, alongY);
}

function round(value) {
  return Math.round(value * 10) / 10;
}

/**
 * @param {import("../../data/projects").Architecture} architecture
 */
export function layoutArchitecture(architecture) {
  const columns = architecture.nodes.map((node) => node.column);
  const rows = architecture.nodes.map((node) => node.row);
  const firstColumn = Math.min(...columns);
  const firstRow = Math.min(...rows);
  const width = (Math.max(...columns) - firstColumn + 1) * CELL_WIDTH;
  const height = (Math.max(...rows) - firstRow + 1) * CELL_HEIGHT;

  const nodes = architecture.nodes.map((node) => ({
    ...node,
    x: (node.column - firstColumn + 0.5) * CELL_WIDTH,
    y: (node.row - firstRow + 0.5) * CELL_HEIGHT,
  }));
  const byId = new Map(nodes.map((node) => [node.id, node]));

  const edges = architecture.steps.map((step, index) => {
    const from = byId.get(step.from);
    const to = byId.get(step.to);
    const hasReverse = architecture.steps.some(
      (other) => other.from === step.to && other.to === step.from,
    );
    const direction = unit(to.x - from.x, to.y - from.y);
    const bend = hasReverse ? PAIR_BEND : 0;
    const control = {
      x: (from.x + to.x) / 2 - direction.y * bend,
      y: (from.y + to.y) / 2 + direction.x * bend,
    };

    const leaving = unit(control.x - from.x, control.y - from.y);
    const arriving = unit(control.x - to.x, control.y - to.y);
    const start = {
      x: from.x + leaving.x * (distanceToEdge(leaving) + START_GAP),
      y: from.y + leaving.y * (distanceToEdge(leaving) + START_GAP),
    };
    const end = {
      x: to.x + arriving.x * (distanceToEdge(arriving) + END_GAP),
      y: to.y + arriving.y * (distanceToEdge(arriving) + END_GAP),
    };

    // Arrowhead at the end, pointing the way the line travels.
    const tip = {
      x: end.x - arriving.x * ARROW_LENGTH,
      y: end.y - arriving.y * ARROW_LENGTH,
    };
    const left = {
      x: end.x - arriving.y * ARROW_HALF_WIDTH,
      y: end.y + arriving.x * ARROW_HALF_WIDTH,
    };
    const right = {
      x: end.x + arriving.y * ARROW_HALF_WIDTH,
      y: end.y - arriving.x * ARROW_HALF_WIDTH,
    };

    return {
      index,
      step,
      from,
      to,
      path: `M ${round(start.x)} ${round(start.y)} Q ${round(control.x)} ${round(control.y)} ${round(end.x)} ${round(end.y)}`,
      arrow: [tip, left, right]
        .map((point) => `${round(point.x)},${round(point.y)}`)
        .join(" "),
      // The curve's midpoint, for the step number.
      badge: {
        x: round(0.25 * start.x + 0.5 * control.x + 0.25 * end.x),
        y: round(0.25 * start.y + 0.5 * control.y + 0.25 * end.y),
      },
    };
  });

  return { width, height, nodes, edges };
}

/**
 * The step in which each part first appears: the first step that starts
 * from it, or ends at it. The first step's source is there from the start.
 * @param {import("../../data/projects").Architecture} architecture
 * @returns {Map<string, { step: number, asSource: boolean }>}
 */
export function firstAppearances(architecture) {
  const appearances = new Map();
  architecture.steps.forEach((step, index) => {
    if (!appearances.has(step.from)) {
      appearances.set(step.from, { step: index, asSource: true });
    }
    if (!appearances.has(step.to)) {
      appearances.set(step.to, { step: index, asSource: false });
    }
  });
  return appearances;
}
