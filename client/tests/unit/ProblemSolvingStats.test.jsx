import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

const EMPTY = {
  codeforces: null,
  vjudge: null,
  practice: null,
  judges: [],
  total: 0,
};
const coding = vi.hoisted(() => ({
  stats: null,
  paused: true,
  dimik: null,
}));
vi.mock("../../src/data/coding", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    get codingStats() {
      return coding.stats;
    },
    get hasCodingStats() {
      const { codeforces, vjudge, practice } = coding.stats;
      return Boolean(codeforces || vjudge || practice);
    },
    get isPracticePaused() {
      return coding.paused;
    },
    get dimikSolved() {
      return coding.dimik;
    },
    distinctSolved: () => actual.distinctSolved(coding.stats, coding.dimik),
    practicePeriod: (stats = coding.stats) => actual.practicePeriod(stats),
  };
});

const { ProblemSolvingStats } =
  await import("../../src/features/coding/ProblemSolvingStats");
const { practicePeriod } = await import("../../src/data/coding");
const { distinctSolved } = await vi.importActual("../../src/data/coding");

const STATS = {
  codeforces: {
    handle: "jahidjubaer17",
    url: "https://codeforces.com/profile/jahidjubaer17",
    rating: 782,
    maxRating: 782,
    rank: "newbie",
    maxRank: "newbie",
    solved: 21,
    contests: 4,
    firstActiveAt: "2024-05-26T16:34:08.000Z",
    lastActiveAt: "2025-01-10T02:36:31.000Z",
  },
  vjudge: {
    handle: "jahidjubaer01",
    url: "https://vjudge.net/user/jahidjubaer01",
    solved: 207,
    byJudge: [
      { judge: "Gym", solved: 87 },
      { judge: "CodeForces", solved: 47 },
    ],
  },
  practice: {
    name: "Programming",
    url: "https://github.com/jahidjubaer/Programming",
    createdAt: "2024-10-18T05:33:17Z",
    pushedAt: "2025-07-05T17:13:18Z",
    files: 260,
    folders: [{ folder: "Codeforces", files: 15 }],
  },
  judges: [
    { judge: "Gym", solved: 87, direct: 0, vjudge: 87, overlap: 0 },
    { judge: "CodeForces", solved: 54, direct: 21, vjudge: 47, overlap: 14 },
  ],
  total: 141,
};

describe("ProblemSolvingStats", () => {
  it("shows synced numbers as a dated archive when practice is paused", () => {
    coding.stats = STATS;
    coding.paused = true;
    coding.dimik = null;
    render(<ProblemSolvingStats />);
    expect(screen.getByText("Practice archive")).toBeVisible();
    expect(screen.getByText("May 2024 – Jul 2025")).toBeVisible();
    expect(screen.getByText("141")).toBeVisible();
    expect(screen.getByText("on 2 judges, each counted once")).toBeVisible();
    expect(screen.getByText("782")).toBeVisible();
    expect(screen.getByText("260")).toBeVisible();
    expect(screen.queryByText("Dimik OJ")).toBeNull();
    expect(
      screen.getByText(/not practising competitively right now/),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Solutions repo/ }),
    ).toHaveAttribute("href", "https://github.com/jahidjubaer/Programming");
  });

  it("lists each origin judge with where it was solved", () => {
    coding.stats = STATS;
    coding.dimik = null;
    render(<ProblemSolvingStats />);
    const table = screen.getByRole("table", {
      name: "Problems solved per judge",
    });
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent(
      "Codeforces GymAssiut training sheets87via VJudge",
    );
    expect(rows[1]).toHaveTextContent(
      "Codeforces54account and VJudge · 14 on both",
    );
  });

  it("highlights Dimik OJ and adds it to the headline", () => {
    coding.stats = STATS;
    coding.dimik = 40;
    render(<ProblemSolvingStats />);
    // The card, not the map's label (the map is a picture, aria-hidden).
    const card = screen.getByText("Dimik OJ", { selector: "p" }).parentElement;
    expect(card).toBeVisible();
    expect(within(card).getByText("40")).toBeVisible();
    expect(screen.getByText("181")).toBeVisible();
    expect(screen.getByText("on 3 judges, each counted once")).toBeVisible();
  });

  it("drops the archive framing while practice is active", () => {
    coding.stats = STATS;
    coding.paused = false;
    render(<ProblemSolvingStats />);
    expect(screen.queryByText("Practice archive")).toBeNull();
    expect(screen.queryByText(/not practising/)).toBeNull();
  });

  it("falls back to the profile summary before the first sync", () => {
    coding.stats = EMPTY;
    render(<ProblemSolvingStats />);
    expect(screen.getByText(/problems solved in C\+\+/)).toBeVisible();
  });
});

describe("distinctSolved", () => {
  it("adds Dimik OJ to the merged total, and is null before a sync", () => {
    expect(distinctSolved(STATS, null)).toBe(141);
    expect(distinctSolved(STATS, 40)).toBe(181);
    expect(distinctSolved(EMPTY, 40)).toBeNull();
  });
});

describe("practicePeriod", () => {
  it("spans the earliest start to the latest activity", () => {
    expect(practicePeriod(STATS)).toEqual({
      start: "2024-05-26T16:34:08.000Z",
      end: "2025-07-05T17:13:18Z",
    });
    expect(practicePeriod({ codeforces: null, practice: null })).toBeNull();
  });
});
