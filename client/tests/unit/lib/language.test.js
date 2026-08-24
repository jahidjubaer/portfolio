import { describe, it, expect } from "vitest";
import { detectTextLanguage } from "../../../src/lib/language";

describe("detectTextLanguage", () => {
  it("returns 'bn' for Bengali text", () => {
    expect(detectTextLanguage("জাভা স্ক্রিপ্ট পরিচিতি পর্ব")).toBe("bn");
  });

  it("returns 'bn' for Bengali text mixed with an embedded English term", () => {
    expect(
      detectTextLanguage("শুরুর আগে - কিভাবে - JavaScript | পর্ব - ২য়"),
    ).toBe("bn");
  });

  it("returns undefined for plain English text", () => {
    expect(detectTextLanguage("Read article")).toBeUndefined();
    expect(detectTextLanguage("View all learning")).toBeUndefined();
  });

  it("returns undefined for an English-formatted date string", () => {
    expect(detectTextLanguage("September 12, 2025")).toBeUndefined();
  });

  it("returns undefined for empty, whitespace-only, or non-string input", () => {
    expect(detectTextLanguage("")).toBeUndefined();
    expect(detectTextLanguage("   ")).toBeUndefined();
    expect(detectTextLanguage(null)).toBeUndefined();
    expect(detectTextLanguage(undefined)).toBeUndefined();
  });
});
