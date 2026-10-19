/**
 * Converts stored content to an editable "draft" and back. Inputs edit
 * plain strings, so list fields are text while editing (one item per line,
 * or paragraphs separated by a blank line) and turn back into arrays only
 * on save. That keeps typing natural: a trailing newline isn't lost.
 *
 * Field types: text, email, url, date, textarea, markdown, number, select,
 * checkbox, checkboxes (several values from `options`), lines,
 * paragraphs, json, image (an uploaded `{ url, width, height }`), pdf (URL
 * text with an upload button), objectList (with nested `fields`).
 * Flags: `optional` (blank or unticked → field removed), `nullable`
 * (blank → null). A select's `placeholder` is its blank first option;
 * `quickAdd: "organizations"` adds a "New organization" button under it.
 * `half` lets two consecutive fields share a row on wider screens.
 * `showWhen(item)` hides an objectList sub-field for some items.
 *
 * @typedef {{
 *   name: string,
 *   label: string,
 *   type?: string,
 *   hint?: string,
 *   optional?: boolean,
 *   nullable?: boolean,
 *   rows?: number,
 *   options?: Array<{ value: string, label: string }>,
 *   placeholder?: string,
 *   quickAdd?: "organizations",
 *   half?: boolean,
 *   fields?: Field[],
 *   itemLabel?: string,
 *   newItem?: Record<string, unknown>,
 *   readOnlyWhenEditing?: boolean,
 *   uploadKind?: "photo" | "image",
 *   showWhen?: (item: Record<string, unknown>) => boolean,
 * }} Field
 */

/** @param {unknown} source @param {string} path */
export function getAt(source, path) {
  return path
    .split(".")
    .reduce((value, key) => (value == null ? undefined : value[key]), source);
}

/** Immutable set of a dotted path, creating objects along the way. */
export function setAt(source, path, value) {
  const [key, ...rest] = path.split(".");
  const container = Array.isArray(source) ? [...source] : { ...source };
  container[key] = rest.length
    ? setAt(source?.[key] ?? {}, rest.join("."), value)
    : value;
  return container;
}

function toDraftValue(field, value) {
  switch (field.type) {
    case "lines":
      return (value ?? []).join("\n");
    case "paragraphs":
      return (value ?? []).join("\n\n");
    case "json":
      return value == null ? "" : JSON.stringify(value, null, 2);
    case "number":
      return value == null ? "" : String(value);
    case "checkbox":
      return Boolean(value);
    case "checkboxes":
      return value ?? [];
    case "image":
      return value ?? null;
    case "objectList":
      return (value ?? []).map((item) => toDraft(item, field.fields));
    default:
      return value ?? "";
  }
}

/**
 * @param {Record<string, unknown>} value
 * @param {Field[]} fields
 */
export function toDraft(value, fields) {
  let draft = { ...value };
  for (const field of fields) {
    draft = setAt(
      draft,
      field.name,
      toDraftValue(field, getAt(value, field.name)),
    );
  }
  return draft;
}

function fromDraftValue(field, raw) {
  switch (field.type) {
    case "lines":
      return raw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    case "paragraphs":
      return raw
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
    case "json":
      if (raw.trim() === "") return null;
      // An invalid JSON string is passed through so validation can flag it.
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    case "number":
      return raw === "" ? undefined : Number(raw);
    case "checkbox":
      return field.optional && !raw ? undefined : Boolean(raw);
    case "checkboxes":
      return raw;
    case "image":
      if (raw) return raw;
      return field.optional ? undefined : null;
    case "objectList":
      return raw.map((item) => fromDraft(item, field.fields));
    default: {
      const text = typeof raw === "string" ? raw.trim() : raw;
      if (text === "" && field.nullable) return null;
      if (text === "" && field.optional) return undefined;
      return text;
    }
  }
}

/**
 * @param {Record<string, unknown>} draft
 * @param {Field[]} fields
 */
export function fromDraft(draft, fields) {
  let value = { ...draft };
  for (const field of fields) {
    value = setAt(
      value,
      field.name,
      fromDraftValue(field, getAt(draft, field.name)),
    );
  }
  return removeUndefined(value);
}

function removeUndefined(value) {
  if (Array.isArray(value)) return value.map(removeUndefined);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, removeUndefined(entry)]),
    );
  }
  return value;
}

/**
 * Zod issues → { "dotted.path": "message" }, first message per path.
 * @param {Array<{ path: string | Array<string | number>, message: string }>} issues
 */
export function issuesToErrors(issues) {
  const errors = {};
  for (const issue of issues) {
    const path = Array.isArray(issue.path) ? issue.path.join(".") : issue.path;
    errors[path] ??= issue.message;
  }
  return errors;
}

/**
 * The error for a field: an exact match, or (for list-like fields) the
 * first error on one of its items, e.g. "stack.2" for the "stack" field.
 * @param {Record<string, string>} errors
 * @param {string} path
 * @param {boolean} [includeChildren]
 */
export function errorFor(errors, path, includeChildren = true) {
  if (errors[path]) return errors[path];
  if (!includeChildren) return undefined;
  const child = Object.keys(errors).find((key) => key.startsWith(`${path}.`));
  return child ? errors[child] : undefined;
}
