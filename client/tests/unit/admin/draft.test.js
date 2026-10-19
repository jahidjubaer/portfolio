import { describe, expect, it } from "vitest";
import {
  errorFor,
  fromDraft,
  getAt,
  issuesToErrors,
  setAt,
  toDraft,
} from "../../../src/features/admin/form/draft";

const FIELDS = [
  { name: "title", label: "Title" },
  { name: "note", label: "Note", optional: true },
  { name: "url", label: "URL", nullable: true },
  { name: "tags", label: "Tags", type: "lines" },
  { name: "about", label: "About", type: "paragraphs" },
  { name: "year", label: "Year", type: "number" },
  { name: "meta.flag", label: "Flag", type: "checkbox" },
  { name: "extra", label: "Extra", type: "json" },
  {
    name: "links",
    label: "Links",
    type: "objectList",
    fields: [
      { name: "label", label: "Label" },
      { name: "tags", label: "Tags", type: "lines" },
    ],
  },
];

describe("draft conversion", () => {
  const value = {
    title: "Hello",
    url: "https://a.example",
    tags: ["a", "b"],
    about: ["One.", "Two."],
    year: 2024,
    meta: { flag: true },
    extra: { deep: [1] },
    links: [{ label: "Repo", tags: ["x"] }],
    untouched: 5,
  };

  it("round-trips a value through the editable draft", () => {
    const draft = toDraft(value, FIELDS);
    expect(draft.tags).toBe("a\nb");
    expect(draft.about).toBe("One.\n\nTwo.");
    expect(draft.year).toBe("2024");
    expect(draft.links[0].tags).toBe("x");
    expect(fromDraft(draft, FIELDS)).toEqual(value);
  });

  it("drops blank optional fields and nulls blank nullable ones", () => {
    const draft = { ...toDraft(value, FIELDS), note: "  ", url: "" };
    const output = fromDraft(draft, FIELDS);
    expect(output).not.toHaveProperty("note");
    expect(output.url).toBeNull();
  });

  it("ignores blank lines and trims list items", () => {
    const draft = { ...toDraft(value, FIELDS), tags: " a \n\n b\n" };
    expect(fromDraft(draft, FIELDS).tags).toEqual(["a", "b"]);
  });

  it("passes invalid JSON through for validation to flag", () => {
    const draft = { ...toDraft(value, FIELDS), extra: "{oops" };
    expect(fromDraft(draft, FIELDS).extra).toBe("{oops");
  });
});

describe("paths and errors", () => {
  it("reads and immutably writes dotted paths", () => {
    const source = { a: { b: 1 }, list: [{ c: 1 }] };
    const next = setAt(source, "list.0.c", 2);
    expect(getAt(next, "list.0.c")).toBe(2);
    expect(Array.isArray(next.list)).toBe(true);
    expect(source.list[0].c).toBe(1);
  });

  it("finds a field's own or first child error", () => {
    const errors = issuesToErrors([
      { path: ["stack", 2], message: "Required." },
      { path: "email", message: "Bad email." },
    ]);
    expect(errorFor(errors, "email")).toBe("Bad email.");
    expect(errorFor(errors, "stack")).toBe("Required.");
    expect(errorFor(errors, "stack", false)).toBeUndefined();
  });
});
