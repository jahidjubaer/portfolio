import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProblemMap } from "../../src/features/coding/ProblemMap";
import {
  buildClusters,
  clusterDots,
} from "../../src/features/coding/problem-map";

const JUDGES = [
  { judge: "Gym", solved: 87, direct: 0, vjudge: 87, overlap: 0 },
  { judge: "CodeForces", solved: 54, direct: 21, vjudge: 47, overlap: 14 },
  { judge: "AtCoder", solved: 23, direct: 0, vjudge: 23, overlap: 0 },
];

describe("buildClusters", () => {
  it("splits a judge solved both ways so the overlap counts once", () => {
    const codeforces = buildClusters(JUDGES, null).find(
      (cluster) => cluster.key === "CodeForces",
    );
    expect(codeforces.segments).toEqual([
      { kind: "direct", count: 7 },
      { kind: "both", count: 14 },
      { kind: "vjudge", count: 33 },
    ]);
    const dots = codeforces.segments.reduce((sum, s) => sum + s.count, 0);
    expect(dots).toBe(codeforces.total);
  });

  it("can't split without problem ids", () => {
    const [cluster] = buildClusters(
      [
        {
          judge: "CodeForces",
          solved: 47,
          direct: 21,
          vjudge: 47,
          overlap: null,
        },
      ],
      null,
    );
    expect(cluster.segments).toEqual([{ kind: "merged", count: 47 }]);
  });

  it("adds Dimik OJ, highlighted, and orders clusters largest first", () => {
    const clusters = buildClusters(JUDGES, 60);
    expect(clusters.map((cluster) => cluster.key)).toEqual([
      "Gym",
      "dimik",
      "CodeForces",
      "AtCoder",
    ]);
    expect(clusters[1]).toMatchObject({ name: "Dimik OJ", highlight: true });
    expect(buildClusters(JUDGES, null)).toHaveLength(3);
  });
});

describe("clusterDots", () => {
  it("lays one dot per problem on a near-square grid", () => {
    const [gym] = buildClusters(JUDGES, null);
    const { dots, width, height } = clusterDots(gym);
    expect(dots).toHaveLength(87);
    expect(width).toBe(10 * 12);
    expect(height).toBe(9 * 12);
    expect(clusterDots(gym)).toEqual({ dots, width, height });
  });
});

describe("ProblemMap", () => {
  it("writes each judge's name and count, and draws every dot", () => {
    const { container } = render(
      <ProblemMap judges={JUDGES} dimikSolved={null} total={164} />,
    );
    expect(screen.getByText("Codeforces Gym")).toBeInTheDocument();
    expect(screen.getByText("87")).toBeInTheDocument();
    expect(container.querySelectorAll("circle.problem-dot")).toHaveLength(
      87 + 54 + 23,
    );
    expect(
      screen.getByText(/One dot per problem · 164 distinct/),
    ).toBeVisible();
    expect(screen.getByText("Both, counted once")).toBeInTheDocument();
  });

  it("starts with the dots showing, so prerendered HTML never hides them", () => {
    const { container } = render(
      <ProblemMap judges={JUDGES} dimikSolved={null} total={164} />,
    );
    expect(container.querySelector(".problem-map-armed")).toBeNull();
  });
});
