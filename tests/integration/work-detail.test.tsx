import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import WorkDetail from "~/routes/work/detail";

describe("WorkDetail route", () => {
  it("renders a controlled not-found state for an unknown slug", () => {
    // @ts-expect-error -- minimal params shape sufficient for this component
    render(<WorkDetail params={{ slug: "sarabo" }} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /project not found/i }),
    ).toBeInTheDocument();
  });

  it("renders the validation placeholder for the known framework-validation slug", () => {
    render(
      // @ts-expect-error -- minimal params shape sufficient for this component
      <WorkDetail params={{ slug: "framework-validation" }} />,
    );
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /project route validation/i,
      }),
    ).toBeInTheDocument();
  });
});
