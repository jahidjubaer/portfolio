/**
 * Geometry for the opening curtain's torn seam. Both halves trace the same
 * jagged line, so they fit together like one sheet torn down the middle.
 * The line is generated from a fixed seed: identical on every visit, and
 * stable between renders.
 */

// Each panel overlaps the centre line by this much, room for the tear to wander.
export const TEAR_OVERLAP_PX = 16;
const MAX_OFFSET_PX = 11;
const POINTS = 44;

/** Small seeded PRNG (mulberry32): deterministic, good enough for jitter. */
function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Horizontal offsets (px) of the tear from the centre line, top to bottom:
 * a random walk for the wander, plus a little jitter for the fibres.
 * @returns {Array<{ y: number, dx: number }>} y in percent
 */
function tearLine(seed = 11) {
  const random = seededRandom(seed);
  const points = [];
  let walk = 0;
  for (let index = 0; index <= POINTS; index += 1) {
    walk += (random() - 0.5) * 7;
    walk = Math.max(-MAX_OFFSET_PX + 2, Math.min(MAX_OFFSET_PX - 2, walk));
    const jitter = (random() - 0.5) * 4;
    points.push({
      y: (index / POINTS) * 100,
      dx: Math.round((walk + jitter) * 10) / 10,
    });
  }
  return points;
}

const LINE = tearLine();

/**
 * CSS clip-path for one half. `grow` pushes the edge outward (px), used
 * for the lighter fibre strip that peeks out from under the paper.
 * Panels are `50% + TEAR_OVERLAP_PX` wide: the left one starts at the
 * viewport's left edge, the right one ends at its right edge.
 * `straight` gives the clean-split style: the same overlap, no tear.
 * @param {"left" | "right"} side
 * @param {number} [grow]
 * @param {boolean} [straight]
 */
export function tornClipPath(side, grow = 0, straight = false) {
  const line = straight ? LINE.map(({ y }) => ({ y, dx: 0 })) : LINE;
  if (side === "left") {
    const edge = line.map(
      ({ y, dx }) =>
        `calc(100% - ${TEAR_OVERLAP_PX - dx - grow}px) ${y.toFixed(2)}%`,
    );
    return `polygon(0 0, ${edge.join(", ")}, 0 100%)`;
  }
  const edge = line
    .slice()
    .reverse()
    .map(({ y, dx }) => `${TEAR_OVERLAP_PX + dx - grow}px ${y.toFixed(2)}%`);
  return `polygon(100% 0, 100% 100%, ${edge.join(", ")})`;
}
