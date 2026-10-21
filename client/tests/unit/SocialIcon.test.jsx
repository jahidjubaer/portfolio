import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SocialIcon } from "../../src/components/icons/SocialIcon";

function markup(id) {
  return render(<SocialIcon id={id} />).container.innerHTML;
}

describe("SocialIcon", () => {
  it("gives each judge its own mark instead of the generic code glyph", () => {
    const fallback = markup("unknown");
    for (const id of ["codeforces", "vjudge", "leetcode"]) {
      expect(markup(id)).not.toBe(fallback);
    }
    expect(new Set(["codeforces", "vjudge", "leetcode"].map(markup)).size).toBe(
      3,
    );
  });
});
