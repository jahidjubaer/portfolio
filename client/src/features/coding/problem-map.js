import { judgeLabel } from "./judges";

/*
 * The problem-solving map: one dot per distinct solved problem, grouped
 * by the judge it comes from. Pure functions, so the prerendered and
 * hydrated markup always match.
 */

export const DOT_PITCH = 12;
export const DOT_RADIUS = 4;

/**
 * Where a cluster's dots came from. A judge solved both on its own site
 * and through VJudge splits into three parts, so the overlap shows as
 * counted once; without problem ids (overlap null) it can't be split.
 * @typedef {"direct" | "both" | "vjudge" | "merged" | "manual"} DotKind
 * @typedef {{ kind: DotKind, count: number }} Segment
 * @typedef {{ key: string, name: string, note?: string, total: number, highlight: boolean, segments: Segment[] }} Cluster
 */

/** @param {import("../../data/coding").JudgeStats} entry @returns {Segment[]} */
function segmentsOf(entry) {
  if (entry.direct > 0 && entry.vjudge > 0) {
    if (entry.overlap === null)
      return [{ kind: "merged", count: entry.solved }];
    return [
      { kind: "direct", count: entry.direct - entry.overlap },
      { kind: "both", count: entry.overlap },
      { kind: "vjudge", count: entry.vjudge - entry.overlap },
    ].filter((segment) => segment.count > 0);
  }
  return [
    { kind: entry.direct > 0 ? "direct" : "vjudge", count: entry.solved },
  ];
}

/**
 * @param {import("../../data/coding").JudgeStats[]} judges
 * @param {number | null} dimikSolved
 * @returns {Cluster[]} largest first
 */
export function buildClusters(judges, dimikSolved) {
  const clusters = judges
    .filter((entry) => entry.solved > 0)
    .map((entry) => {
      const label = judgeLabel(entry.judge);
      return {
        key: entry.judge,
        name: label.name,
        note: label.note,
        total: entry.solved,
        highlight: false,
        segments: segmentsOf(entry),
      };
    });
  if (dimikSolved) {
    clusters.push({
      key: "dimik",
      name: "Dimik OJ",
      note: "Bangla judge",
      total: dimikSolved,
      highlight: true,
      segments: [{ kind: "manual", count: dimikSolved }],
    });
  }
  return clusters.sort((a, b) => b.total - a.total);
}

/**
 * Dot positions for one cluster: a near-square grid filled row by row,
 * segment after segment.
 * @param {Cluster} cluster
 */
export function clusterDots(cluster) {
  const columns = Math.max(3, Math.ceil(Math.sqrt(cluster.total)));
  const rows = Math.ceil(cluster.total / columns);
  const dots = [];
  for (const segment of cluster.segments) {
    for (let i = 0; i < segment.count; i += 1) {
      const index = dots.length;
      dots.push({
        index,
        kind: segment.kind,
        cx: (index % columns) * DOT_PITCH + DOT_PITCH / 2,
        cy: Math.floor(index / columns) * DOT_PITCH + DOT_PITCH / 2,
      });
    }
  }
  return { width: columns * DOT_PITCH, height: rows * DOT_PITCH, dots };
}
