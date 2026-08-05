import { describe, expect, it } from "vitest";

import {
  FRAMEWORK_VALIDATION_SLUG,
  isKnownProjectSlug,
} from "~/lib/project-slug";

describe("isKnownProjectSlug", () => {
  it("returns true for the framework validation slug", () => {
    expect(isKnownProjectSlug(FRAMEWORK_VALIDATION_SLUG)).toBe(true);
  });

  it("returns false for any unrecognized slug", () => {
    expect(isKnownProjectSlug("sarabo")).toBe(false);
    expect(isKnownProjectSlug("")).toBe(false);
  });
});
